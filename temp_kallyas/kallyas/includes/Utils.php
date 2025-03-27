<?php

namespace Kallyas;

use Kallyas\Kallyas;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Utils {

	/**
	 * Get File Path
	 *
	 * Will return the file path starting with the plugin directory for the given path
	 *
	 * @param string $path The path that will be appended to the plugin path
	 *
	 * @return string
	 */
	public static function get_file_path( $path = '' ) {
		return Kallyas::get_instance()->get_root_path() . $path;
	}

	/**
	 * Get File URL
	 *
	 * Will return the file url starting with the plugin directory for the given path
	 *
	 * @param string $path The path that will be appended to the plugin URL
	 * @param string|null $scheme Optional. Scheme to give $url. Currently 'http', 'https', 'login',
	 *                      'login_post', 'admin', 'relative', 'rest', 'rpc', or null. Default null.
	 *
	 * @return string
	 */
	public static function get_file_url( $path = '', $scheme = null ) {
		return set_url_scheme( Kallyas::get_instance()->get_root_url() . $path, $scheme );
	}

	/**
	 * Get Directory Info
	 *
	 * Returns the directory url and path for a given file/path
	 *
	 * @param mixed $path
	 *
	 * @return string
	 */
	public static function get_file_url_from_path( $path ) {
		// Set base URI
		$theme_base = get_template_directory();

		// Normalize paths
		$theme_base = wp_normalize_path( $theme_base );
		$path       = wp_normalize_path( $path );

		$directory_path = WP_CONTENT_DIR;
		$fw_basename    = str_replace( wp_normalize_path( $directory_path ), '', $path );

		return content_url() . $fw_basename;
	}

	/**
	 * Get Directory Info
	 *
	 * Returns the directory url and path for a given file/path
	 *
	 * @param mixed $path
	 *
	 * @return string
	 */
	public static function get_file_path_from_url( $path ) {
		// Set base URI
		$theme_base = get_template_directory_uri();
		$path       = wp_normalize_path( $path );

		$is_theme       = preg_match( '#' . $theme_base . '#', $path );
		$directory_path = ( $is_theme ) ? get_template_directory() : \WP_PLUGIN_DIR;
		$directory_uri  = ( $is_theme ) ? $theme_base : plugins_url();
		$fw_basename    = str_replace( wp_normalize_path( $directory_uri ), '', $path );

		return $directory_path . $fw_basename;
	}
}
