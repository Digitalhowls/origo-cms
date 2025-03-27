<?php

use Kallyas\License;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Theme's service. Interacts with our demo server and retrieves the list of all available demos.
 * @requires valid user
 */
class ZN_HogashDashboard {
	public static function isConnected() {
		_doing_it_wrong( __METHOD__, 'This method is deprecated. Please use License::get_license_key() instead.', '4.19.6' );
		return License::get_license_key();
	}

	/**
	 * Utility method that child themes can use to directly register the theme on a MultiSite installation and when the theme is not active on the main site
	 * @param string $apiKey The API Key to use for registration
	 * @since v4.9.1
	 */
	public static function directConnect( $api_key ) {
		$constant_name = strtoupper( kallyas()->get_theme_id() ) . '_API_KEY';
		define( $constant_name, $api_key );
		_doing_it_wrong( __METHOD__, 'This method is deprecated. Please define a constant named "KALLYAS_API_KEY" instead.', '4.19.6' );
	}
}
