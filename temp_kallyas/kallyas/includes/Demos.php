<?php

namespace Kallyas;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Demos {
	const DAYS_TO_CACHE = 30;

	public function __construct() {
		add_action( 'dash_clear_cached_data', array( __CLASS__, 'delete_demos_list' ), 0 );
	}

	public static function get_cache_key( $prefix = '' ) {
		$theme = Kallyas::get_instance();
		return $theme->get_theme_id() . '_' . $prefix;
	}


	public static function get_demo_info( $demo_id ) {
		$demos = self::get_demos_list();

		return isset( $demos[ $demo_id ] ) ? $demos[ $demo_id ] : false;
	}


	/**
	 * Returns a cached list of demos
	 *
	 * @param boolean $force If we need to refresh the list of demos from the server
	 * @return array The list of demos
	 */
	public static function get_demos_list() {

		$cache_key    = self::get_cache_key( 'demos' );
		$cached_demos = get_transient( $cache_key );

		// If we don't have the list of plugins in the cache, we need to get it from the server
		if ( false === $cached_demos ) {
			$demos_from_server = kallyas()->server_api->get_demos_list();

			if ( is_wp_error( $demos_from_server ) ) {
				// Save empty list of plugins in case of server error. The user will have to refresh the list of plugins manually
				self::save_demos_list( [] );
				return [];
			} else {
				self::save_demos_list( $demos_from_server );
				return $demos_from_server;
			}
		}

		return $cached_demos;
	}

	/**
	 * Save the list of demos in the cache
	 *
	 * @param array $demos The list of demos
	 */
	public static function save_demos_list( $demos ) {
		$cache_key = self::get_cache_key( 'demos' );
		set_transient( $cache_key, $demos, self::DAYS_TO_CACHE * DAY_IN_SECONDS );
	}

	/**
	 * Delete the list of demos from the cache
	 */
	public static function delete_demos_list() {
		$cache_key = self::get_cache_key( 'demos' );
		delete_transient( $cache_key );
	}
}
