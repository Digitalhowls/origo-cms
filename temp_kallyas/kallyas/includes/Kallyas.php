<?php

namespace Kallyas;

use Kallyas\ServerAPI;
use Kallyas\Integrations;
use Kallyas\Api\RestApi;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Kallyas {
	/**
	 * Theme instance.
	 *
	 * @since 1.0.0
	 * @access public
	 * @static
	 *
	 * @var Kallyas
	 */
	public static $instance = null;

	/**
	 * Theme version
	 */
	private $version = '1.0.0';

	/**
	 * Root path for the theme
	 */
	private $project_root_path = '';

	/**
	 * Root URL for the theme
	 */
	private $project_root_url = '';

	/**
	 * Theme info
	 */
	public $theme_info = null;


	/**
	 * Theme config
	 */
	private $theme_config = null;

	/**
	 * Server API
	 *
	 * @var ServerAPI
	 */
	public $server_api = null;

	/**
	 * Updater
	 */
	public $updater = null;

	/**
	 * Updater
	 */
	public $integrations = null;

	/**
	 * Dashboard
	 */
	public $dashboard = null;

	/**
	 * Scripts
	 */
	public $scripts = null;

	/**
	 * License
	 */
	public $license = null;

	/**
	 * Plugins
	 *
	 * @var Plugins
	 */
	public $plugins = null;


	/**
	 * Constructor
	 *
	 * @param array $theme_config
	 */
	public function __construct( $theme_config ) {
		// Load legacy classes
		new Legacy\Legacy();

		// Load normal classes
		$this->theme_info        = $this->get_theme_info();
		$this->project_root_path = trailingslashit( get_template_directory() );
		$this->project_root_url  = trailingslashit( get_template_directory_uri() );
		$this->theme_config      = $theme_config;

		// Static vars
		$this->version = $this->theme_info->get( 'Version' );

		add_action( 'after_setup_theme', [ $this, 'init_theme' ] );

		self::$instance = $this;
	}

	public function init_theme() {
		// Class instances
		$this->server_api = new ServerAPI(
			array(
				'static_api_url'  => $this->theme_config['static_api_url'],
				'private_api_url' => $this->theme_config['private_api_url'],
				'theme_version'   => $this->version,
				'theme_id'        => $this->theme_config['theme_id'],
			)
		);
		new RestApi();
		$this->license      = new License();
		$this->plugins      = new Plugins();
		$this->updater      = new Updater( $this->server_api );
		$this->integrations = new Integrations();
		$this->dashboard    = new Dashboard();
		$this->scripts      = new Scripts();
	}

	/**
	 * Returns the theme info using wp_get_theme
	 *
	 * @return WP_Theme
	 */
	public function get_theme_info() {
		$theme_info = wp_get_theme();

		if ( $theme_info->parent() ) {
			$theme_info = $theme_info->parent();
		}

		return $theme_info;
	}

	/**
	 * Returns the theme id
	 *
	 * @return string The theme id
	 */
	public function get_theme_id() {
		return $this->theme_config['theme_id'];
	}

	/**
	 * Returns the path to a static file from the API server
	 *
	 * @param string $path The path to the file
	 * @return string The full path to the static API server
	 */
	public function get_static_api_url( $path = '' ) {
		return $this->theme_config['static_api'] . $path;
	}

	/**
	 * Returns the theme config
	 *
	 * @param string $value The value to return
	 * @return mixed
	 */
	public function get_theme_config( $value = null ) {
		if ( $value ) {
			return $this->theme_config[ $value ];
		}

		return $this->theme_config;
	}



	public static function get_instance() {
		return self::$instance;
	}


	/**
	 * Returns the theme version
	 *
	 * @return string The theme version
	 */
	public function get_version() {
		return $this->version;
	}


	/**
	 * Returns the url to a file based on the theme root url
	 *
	 * @param string $path
	 * @return string The full URL path
	 */
	public function get_root_url() {
		return $this->project_root_url;
	}

	/**
	 * Returns the path to a file based on the theme root url
	 *
	 * @return string The root path
	 */
	public function get_root_path() {
		return $this->project_root_path;
	}

	/**
	 * Returns the path to a file based on the theme root
	 *
	 * @param string $path The path to the file
	 * @return string The full path
	 */
	public function get_file_url( $path = '' ) {
		return $this->get_root_url() . $path;
	}

	/**
	 * Returns the URL to a file based on the theme root
	 *
	 * @param string $path The path to the file
	 * @return string The full URL path
	 */
	public function get_file_path( $path = '' ) {
		return $this->get_root_path() . $path;
	}
}
