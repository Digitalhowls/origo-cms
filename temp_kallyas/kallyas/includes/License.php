<?php

namespace Kallyas;

use Kallyas\Kallyas;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class License {
	public function __construct() {
		add_action( 'dash_clear_cached_data', array( __CLASS__, 'unregister_license' ), 0 );
	}

	public static function get_db_option_key() {
		$theme = Kallyas::get_instance();
		return $theme->get_theme_id() . '_hg_dash_api_key';
	}

	public static function register_license( $license_key ) {
		return update_option( self::get_db_option_key(), $license_key );
	}

	/**
	 * Unregister the license
	 *
	 * @return bool
	 */
	public static function unregister_license() {
		return delete_option( self::get_db_option_key() );
	}

	/**
	 * Get the license key
	 *
	 * @return string|bool
	 */
	public static function get_license_key() {
		//[1] First check if managed
		$managed_license = self::get_managed_license_key();
		if ( $managed_license ) {
			return wp_strip_all_tags( $managed_license );
		}

		//[2] Secondly check the db option
		$api_key = self::get_license_key_from_db();
		if ( ! empty( $api_key ) ) {
			return wp_strip_all_tags( $api_key );
		}

		return false;
	}

	/**
	 * Get the API key
	 *
	 * @return string
	 */
	public static function get_license_key_from_db() {
		return get_option( self::get_db_option_key(), false );
	}


	/**
	 * Check if the theme is managed by a license constant
	 *
	 * @return bool
	 */
	public static function get_managed_license_key() {
		$theme         = Kallyas::get_instance();
		$constant_name = strtoupper( $theme->get_theme_id() ) . '_API_KEY';
		return defined( "$constant_name" ) ? constant( "$constant_name" ) : false;
	}
}
