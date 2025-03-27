<?php

namespace Kallyas;

use Kallyas\Kallyas;
use Kallyas\License;
use WP_Error;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Plugins {
	/**
	 * Number of days to cache the plugins list retrieved from the server
	 */
	const DAYS_TO_CACHE = 30;

	/**
	 * List of plugins
	 *
	 * @var array|null
	 */
	private static $wp_plugins_list = null;

	public function __construct() {
		add_action( 'dash_clear_cached_data', array( __CLASS__, 'delete_plugins_list' ), 0 );

		// Include the TGM_Plugin_Activation class.
		require_once __DIR__ . '/libraries/class-tgm-plugin-activation.php';

		// Load plugins list in API calls
		add_action( 'tgmpa_register', [ $this, 'register_plugins_to_tgmpa' ] );

		// Inject update info to WP
		add_filter( 'pre_set_site_transient_update_plugins', [ $this, 'transient_update_plugins' ] );
	}

	/**
	 * Injects the update info for the Kallyas plugins into the WP update transient
	 *
	 * @param object $transient
	 *
	 * @return object
	 */
	public function transient_update_plugins( $transient ) {

		if ( License::get_license_key() ) {
			$kallyas_plugins = self::get_plugins_list();

			foreach ( $kallyas_plugins as $slug => $plugin_config ) {
				// Only inject data for our own plugins
				if ( isset( $transient->response[ $slug ] ) ) {
					continue;
				}

				if ( ! $this->is_plugin_installed( $slug ) ) {
					continue;
				}

				if ( $plugin_config['hogash_source_type'] === 'internal' ) {
					$plugin_file_path = self::get_plugin_basename_from_slug( $slug );
					$current_version  = $this->get_installed_version( $slug );
					$new_version      = $plugin_config['version'];

					if ( version_compare( $current_version, $new_version, '<' ) ) {
						$item = (object) array(
							'id'            => $plugin_file_path,
							'slug'          => $slug,
							'plugin'        => $plugin_file_path,
							'new_version'   => $new_version,
							'url'           => Kallyas::get_instance()->theme_info->get( 'ThemeURI' ),
							'package'       => Kallyas::get_instance()->server_api->get_plugin_download_url( $slug ),
							// 'banners'       => array(),
							// 'banners_rtl'   => array(),
							// 'tested'        => '',
							// 'requires_php'  => '',
							'compatibility' => new \stdClass(),
						);

						if ( isset( $plugin_config['plugin_icon'] ) ) {
							$item->icons['2x'] = $plugin_config['plugin_icon'];
							$item->icons['1x'] = $plugin_config['plugin_icon'];
						}

						$transient->response[ $plugin_file_path ] = $item;
					} else {
						$item = (object) array(
							'id'            => $plugin_file_path,
							'slug'          => $slug,
							'plugin'        => $plugin_file_path,
							'new_version'   => $current_version,
							'url'           => Kallyas::get_instance()->theme_info->get( 'ThemeURI' ),
							'package'       => '',
							'icons'         => array(),
							'compatibility' => new \stdClass(),
						);

						if ( isset( $plugin_config['plugin_icon'] ) ) {
							$item->icons['2x'] = $plugin_config['plugin_icon'];
							$item->icons['1x'] = $plugin_config['plugin_icon'];
						}

						$transient->no_update[ $plugin_file_path ] = $item;
					}
				}
			}
		}

		return $transient;
	}

	/**
	 * Retrieve the version number of an installed plugin.
	 *
	 * @since 2.5.0
	 *
	 * @param string $slug Plugin slug.
	 * @return string Version number as string or an empty string if the plugin is not installed
	 *                or version unknown (plugins which don't comply with the plugin header standard).
	 */
	public function get_installed_version( $slug ) {
		$installed_plugins = self::get_wp_plugins();
		$file_path         = self::get_plugin_basename_from_slug( $slug );

		if ( ! empty( $installed_plugins[ $file_path ]['Version'] ) ) {
			return $installed_plugins[ $file_path ]['Version'];
		}

		return '';
	}

	/**
	 * Check if a plugin is installed.
	 *
	 * @param string $slug Plugin slug.
	 *
	 * @return bool True if installed, false otherwise.
	 */
	public function is_plugin_installed( $slug ) {
		$installed_plugins = self::get_wp_plugins();
		$file_path         = self::get_plugin_basename_from_slug( $slug );

		return isset( $installed_plugins[ $file_path ] );
	}

	/**
	 * Returns the cache key for the plugins list
	 *
	 * @param string $prefix
	 * @return string
	 */
	public static function get_cache_key( $prefix = '' ) {
		$theme = Kallyas::get_instance();
		return $theme->get_theme_id() . '_' . $prefix;
	}


	/**
	 * Returns the TGMPA instance
	 *
	 * @return TGM_Plugin_Activation
	 */
	public function get_tgmpa_instance() {
		return call_user_func( [ 'TGM_Plugin_Activation', 'get_instance' ] );
	}

	/**
	 * Register the plugins to the TGMPA class
	 *
	 * @return void
	 */
	public function register_plugins_to_tgmpa() {
		$theme_plugins = self::get_plugins_list();

		$plugins = [];

		foreach ( $theme_plugins as $plugin_id => $plugin_config ) {
			// Do not register child theme plugins
			if ( $plugin_config['addon_type'] === 'child_theme' ) {
				continue;
			}

			if ( $plugin_config['hogash_source_type'] === 'internal' ) {
				$source = get_template_directory() . '/lib/plugins/' . $plugin_config['source'];
			} else {
				$source = $plugin_config['source'];
			}

			$tgmpa_plugin_data = [
				'name'               => $plugin_config['name'],
				'slug'               => $plugin_config['slug'],
				'version'            => $plugin_config['version'],
				'is_callable'        => $plugin_config['is_callable'],
				'required'           => $plugin_config['required'],
				'source'             => $source,
				'force_activation'   => false,
				'force_deactivation' => false,
				// 'external_url'       => $plugin_config['external_url'],
			];

			$plugins[] = $tgmpa_plugin_data;
		}

		/*
		* Array of configuration settings. Amend each line as needed.
		*
		* TGMPA will start providing localized text strings soon. If you already have translations of our standard
		* strings available, please help us make TGMPA even better by giving us access to these translations or by
		* sending in a pull-request with .po file(s) with the translations.
		*
		* Only uncomment the strings in the config array if you want to customize the strings.
		*/
		$config = array(
			'id'           => 'kallyas-tgmpa', // Unique ID for hashing notices for multiple instances of TGMPA.
			'has_notices'  => false, // Show admin notices or not.
			'is_automatic' => true, // Automatically activate plugins after installation or not.
		);

		tgmpa( $plugins, $config );
	}

	/**
	 * Returns a cached list of plugins
	 *
	 * @param boolean $force If we need to refresh the list of plugins from the server
	 * @return array The list of plugins
	 */
	public static function get_plugins_list() {
		$cache_key      = self::get_cache_key( 'plugins_list' );
		$cached_plugins = get_transient( $cache_key );

		// If we don't have the list of plugins in the cache, we need to get it from the server
		if ( false === $cached_plugins ) {
			$plugins_from_server = Kallyas::get_instance()->server_api->get_plugins_list();

			if ( is_wp_error( $plugins_from_server ) ) {
				// Save empty list of plugins in case of server error. The user will have to refresh the list of plugins manually
				self::save_plugins_list( [] );
				return [];
			} else {
				self::save_plugins_list( $plugins_from_server );
				return $plugins_from_server;
			}
		}

		return $cached_plugins;
	}


	/**
	 * Returns the configuration for a single plugin
	 *
	 * @param string $plugin_slug
	 * @return void
	 */
	public function get_plugin_data( $plugin_slug ) {
		$plugins = self::get_plugins_list();

		if ( ! isset( $plugins[ $plugin_slug ] ) ) {
			return false;
		}

		$plugin_config           = $plugins[ $plugin_slug ];
		$plugin_config['status'] = $this->get_plugin_status( $plugin_config );

		return $plugin_config;
	}


	/**
	 * Returns the list of plugins that will be used in the dashboard
	 *
	 * @return array
	 */
	public function get_plugins_list_for_dashboard() {
		$plugins = self::get_plugins_list();

		$plugins_list = [];
		foreach ( $plugins as $plugin ) {
			$plugins_list[] = $this->get_single_plugin_data( $plugin['slug'] );
		}

		return $plugins_list;
	}

	/**
	 * Returns the data for a single plugin that will be used in the dashboard
	 *
	 * @param string $slug
	 * @return array
	 */
	public function get_single_plugin_data( $slug ) {
		$plugins = self::get_plugins_list();

		if ( ! isset( $plugins[ $slug ] ) ) {
			return false;
		}

		$plugin_config = $plugins[ $slug ];

		$plugin_config['status']          = $this->get_plugin_status( $plugin_config );
		$plugin_config['current_version'] = $this->get_installed_version( $slug );

		// Check if the plugin has an update and set the new version number
		if ( $this->does_plugin_have_update( $slug ) ) {
			$repo_updates = get_site_transient( 'update_plugins' );
			$file_path    = self::get_plugin_basename_from_slug( $slug );

			if ( isset( $repo_updates->response[ $file_path ]->new_version ) ) {
				$plugin_config['update_version'] = $repo_updates->response[ $file_path ]->new_version;
			}
		}

		return $plugin_config;
	}

	/**
	 * Check if a plugin has an update available
	 *
	 * @param string $slug
	 * @return string|bool The new version number if an update is available, false otherwise
	 */
	public function does_plugin_have_update( $slug ) {
		$repo_updates = get_site_transient( 'update_plugins' );
		$file_path    = self::get_plugin_basename_from_slug( $slug );

		if ( isset( $repo_updates->response[ $file_path ]->new_version ) ) {
			return $repo_updates->response[ $file_path ]->new_version;
		}

		return false;
	}

	/**
	 * Returns the status of a plugin
	 *
	 * @param array $plugin_config
	 * @return string
	 */
	public function get_plugin_status( $plugin_config ) {
		$status      = 'not_installed';
		$plugin_slug = $plugin_config['slug'];

		if ( ! empty( $plugin_config['addon_type'] ) && $plugin_config['addon_type'] === 'child_theme' ) {
			// Check if the plugin is installed in the child theme
			if ( $this->is_child_theme_installed( $plugin_slug ) ) {
				$status = 'active';
			}
		} elseif ( $this->is_plugin_installed( $plugin_slug ) ) {
			$status = 'inactive';

			if ( $this->does_plugin_have_update( $plugin_slug ) ) {
				$status = 'has_update';
			} elseif ( $this->is_plugin_active( $plugin_slug ) ) {
				$status = 'active';
			}
		} else {
			$status = 'not_installed';
		}

		return $status;
	}

	/**
	 * Wrapper around the core WP get_plugins function, making sure it's actually available.
	 *
	 * @param string $plugin_folder Optional. Relative path to single plugin folder.
	 *
	 * @return array Array of installed plugins with plugin information.
	 */
	public static function get_wp_plugins() {
		if ( is_null( self::$wp_plugins_list ) ) {

			if ( ! function_exists( 'get_plugins' ) ) {
				require_once ABSPATH . 'wp-admin/includes/plugin.php';
			}

			self::$wp_plugins_list = get_plugins();
		}

		return self::$wp_plugins_list;
	}

	/**
	 * Clear the cached list of WP installed plugins
	 */
	public static function clear_cached_plugins_list() {
		self::$wp_plugins_list = null;
	}

	/**
	 * Helper function to extract the plugin file path from the
	 * plugin slug, if the plugin is installed.
	 *
	 * @param string $slug Plugin slug (typically folder name) as provided by the developer.
	 *
	 * @return string|bool Either plugin file path for plugin if installed, or false.
	 */
	protected static function get_plugin_basename_from_slug( $slug ) {
		$keys = array_keys( self::get_wp_plugins() );

		foreach ( $keys as $key ) {
			if ( preg_match( '/^' . $slug . '\//', $key ) ) {
				return $key;
			}
		}

		return false;
	}


	/**
	 * Activate a plugin
	 *
	 * @param string $plugin_path
	 * @param bool $silent
	 * @return bool|\WP_Error
	 */
	public function activate_plugin( $plugin_path, $silent = false ) {

		if ( ! $plugin_path ) {
			return false;
		}

		if ( ! function_exists( 'activate_plugin' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		$activate = activate_plugin( $plugin_path, '', false, $silent );

		if ( is_wp_error( $activate ) ) {
			return $activate;
		}

		return is_null( $activate );
	}


	/**
	 * Activate a plugin by its slug
	 *
	 * @param string $slug
	 * @param bool $silent
	 * @return bool|\WP_Error
	 */
	public function activate_plugin_by_slug( $slug, $silent = false ) {
		return $this->activate_plugin( self::get_plugin_basename_from_slug( $slug ), $silent );
	}

	/**
	 * Check if a plugin is active.
	 *
	 * @param string $slug Plugin slug.
	 *
	 * @return bool True if active, false otherwise.
	 */
	public function is_plugin_active( $slug ) {

		$plugin_path = self::get_plugin_basename_from_slug( $slug );

		if ( empty( $plugin_path ) ) {
			return false;
		}

		if ( ! function_exists( 'is_plugin_active' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return is_plugin_active( $plugin_path );
	}

	/**
	 * Deactivate a plugin
	 *
	 * @param string $plugin_path
	 * @return bool
	 */
	public function deactivate_plugin( $plugin_path ) {

		if ( ! $plugin_path ) {
			return false;
		}

		if ( ! function_exists( 'deactivate_plugins' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}

		return deactivate_plugins( $plugin_path );
	}


	/**
	 * Deactivate a plugin by its slug
	 *
	 * @param string $slug
	 * @return bool
	 */
	public function deactivate_plugin_by_slug( $slug ) {
		return $this->deactivate_plugin( self::get_plugin_basename_from_slug( $slug ) );
	}


	/**
	 * Save the list of plugins in the cache
	 *
	 * @param array $plugins The list of plugins
	 */
	public static function save_plugins_list( $plugins ) {
		$cache_key = self::get_cache_key( 'plugins_list' );
		set_transient( $cache_key, $plugins, self::DAYS_TO_CACHE * DAY_IN_SECONDS );
	}

	/**
	 * Delete the list of plugins from the cache
	 */
	public static function delete_plugins_list() {
		$cache_key = self::get_cache_key( 'plugins_list' );
		delete_transient( $cache_key );
	}


	/**
	 * Performs the plugin update
	 *
	 * @param string $slug
	 */
	public function update_plugin( $slug ) {
		if ( $this->does_plugin_have_update( $slug ) ) {
			if ( ! class_exists( 'Plugin_Upgrader', false ) ) {
				require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
			}

			$skin             = new \WP_Ajax_Upgrader_Skin();
			$upgrader         = new \Plugin_Upgrader( $skin );
			$plugin_file_path = self::get_plugin_basename_from_slug( $slug );
			$result           = $upgrader->bulk_upgrade( [ $plugin_file_path ] );

			if ( is_wp_error( $skin->result ) ) {
				return $skin->result;
			} elseif ( $skin->get_errors()->get_error_code() ) {
				return new \WP_Error( 'plugin_not_updatable', $skin->get_error_messages() );
			} elseif ( is_array( $result ) && ! empty( $result[ $plugin_file_path ] ) ) {
				$plugin_update_data = $result[ $plugin_file_path ];

				if ( true === $plugin_update_data ) {
					return new \WP_Error( 'plugin_not_updatable', esc_html__( 'Plugin update failed.', 'kallyas' ) );
				}

				$plugin_data = get_plugins( '/' . $result[ $plugin_file_path ]['destination_name'] );
				$plugin_data = reset( $plugin_data );

				if ( $plugin_data['Version'] ) {
					return true;
				}
			} elseif ( false === $result ) {
				return new \WP_Error( 'plugin_not_updatable', esc_html__( 'There was a problem updating the plugin.', 'kallyas' ) );
			}

			return new \WP_Error( 'plugin_not_updatable', esc_html__( 'There was a problem updating the plugin.', 'kallyas' ) );
		}

		return new \WP_Error( 'plugin_not_updatable', esc_html__( "The plugin doesn't have an update.", 'kallyas' ) );
	}

	public function install_addon( $slug ) {
		$plugins = self::get_plugins_list();

		if ( ! isset( $plugins[ $slug ] ) ) {
			return new WP_Error( 'plugin_not_found', esc_html__( 'Addon not found.', 'kallyas' ) );
		}

		$plugin_config = $plugins[ $slug ];

		if ( $plugin_config['addon_type'] === 'child_theme' ) {
			return $this->install_theme( $slug );
		} else {
			return $this->install_plugin( $slug );
		}
	}

	public function install_theme( $slug ) {
		// Check if user has the WP capability to install themes.
		if ( ! current_user_can( 'install_themes' ) ) {
			return new WP_Error( 'no_permissions', esc_html__( 'You don\'t have permissions to install themes', 'kallyas' ) );
		}

		if ( $this->is_child_theme_installed( $slug ) ) {
			return $this->activate_child_theme( $slug );
		}

		$download_url = $this->get_download_url( $slug );

		if ( ! $download_url ) {
			return new WP_Error( 'download_url_error', esc_html__( "Error retrieving the plugin's download URL", 'kallyas' ) );
		}

		if ( ! class_exists( 'Theme_Upgrader', false ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		$skin     = new \Automatic_Upgrader_Skin();
		$upgrader = new \Theme_Upgrader( $skin, array( 'clear_destination' => true ) );
		$result   = $upgrader->install( $download_url );

		if ( is_wp_error( $result ) ) {
			return new WP_Error( 'theme_install_error', esc_html__( 'There was a problem installing the theme.', 'kallyas' ) );
		} elseif ( $result === true ) {
			return $this->activate_child_theme( $slug );

		} else {
			return new WP_Error( 'theme_install_error', esc_html__( 'There was a problem installing the theme.', 'kallyas' ) );
		}
	}

	public function is_child_theme_installed() {
		// Get all installed themes
		$current_installed_themes = wp_get_themes();
		// Get the zn themes currently installed
		$active_theme      = wp_get_theme();
		$theme_folder_name = $active_theme->get_template();

		if ( is_array( $current_installed_themes ) ) {
			foreach ( $current_installed_themes as $theme_obj ) {
				if ( $theme_obj->get( 'Template' ) === $theme_folder_name ) {
					return true;
				}
			}
		}
		return false;
	}

	/**
	 * Enable a child theme
	 *
	 * @param string $slug The slug used in the addons config file for the child theme
	 *
	 * @return string A json formatted value
	 */
	public function activate_child_theme() {
		// Get all installed themes
		$current_installed_themes = wp_get_themes();
		// Get the zn themes currently installed
		$active_theme      = wp_get_theme();
		$theme_folder_name = $active_theme->get_template();

		$child_theme = false;

		if ( is_array( $current_installed_themes ) ) {
			foreach ( $current_installed_themes as $theme_obj ) {
				if ( $theme_obj->get( 'Template' ) === $theme_folder_name ) {
					$child_theme = $theme_obj;
				}
			}
		}

		if ( $child_theme !== false ) {
			return switch_theme( $child_theme->get_stylesheet() );
		}
	}

	/**
	 * Performs plugins installation
	 *
	 * @param $slug
	 * @param string $pluginSource The source of the plugin. Empty to use the default functionality. See $this->get_download_url for options
	 *
	 * @return \Wp_Error|bool
	 */
	public function install_plugin( $slug ) {
		// Check if user has the WP capability to install plugins.
		if ( ! current_user_can( 'install_plugins' ) ) {
			return new WP_Error( 'no_permissions', esc_html__( 'You don\'t have permissions to install plugins', 'kallyas' ) );
		}

		if ( $this->is_plugin_installed( $slug ) ) {
			return $this->activate_plugin_by_slug( $slug );
		}

		$download_url = $this->get_download_url( $slug );

		if ( ! $download_url ) {
			return new WP_Error( 'download_url_error', esc_html__( "Error retrieving the plugin's download URL", 'kallyas' ) );
		}

		if ( ! class_exists( 'Plugin_Upgrader', false ) ) {
			require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
		}

		$skin     = new \Automatic_Upgrader_Skin();
		$upgrader = new \Plugin_Upgrader( $skin, array( 'clear_destination' => true ) );
		$result   = $upgrader->install( $download_url );

		wp_cache_flush();
		self::clear_cached_plugins_list();

		if ( is_wp_error( $result ) ) {
			return new WP_Error( 'plugin_install_error', esc_html__( 'There was a problem installing the plugin.', 'kallyas' ) );
		} elseif ( $result === true ) {
			return $this->activate_plugin_by_slug( $slug );

		} else {
			return new WP_Error( 'plugin_install_error', esc_html__( 'There was a problem installing the plugin.', 'kallyas' ) );
		}
	}

	public function get_download_url( $slug ) {
		$plugins = self::get_plugins_list();

		if ( ! isset( $plugins[ $slug ] ) ) {
			return false;
		}

		$plugin_config = $plugins[ $slug ];

		if ( $plugin_config['hogash_source_type'] === 'internal' ) {
			$url = Kallyas::get_instance()->server_api->get_plugin_download_url( $slug );
		} else {
			$url = sprintf( 'https://downloads.wordpress.org/plugin/%s.latest-stable.zip', $slug );
		}

		return $url;
	}
}
