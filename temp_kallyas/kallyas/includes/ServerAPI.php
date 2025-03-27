<?php

namespace Kallyas;

use Kallyas\License;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class ServerAPI {
	/**
	 * 1. Link theme
	 * 2. Unlink theme
	 * 3. Get theme download URL
	 * 4. Get theme update version
	 * 5. Get plugins
	 * 6. Get demos
	 * 7. Get plugin download URL
	 * 8. Get demo download URL
	 */

	/**
	 * The static API URL
	 */
	private $static_api_url;

	/**
	 * The API URL
	 */
	private $api_url;

	/**
	 * The Theme Unique ID
	 */
	private $theme_id;

	/**
	 * The Theme Current version
	 */
	private $theme_version;

	/**
	 * Constructor
	 *
	 * @param string $static_api_url The static API URL
	 * @param string $api_url The API URL
	 */
	public function __construct( $theme_data ) {
		$this->static_api_url = $theme_data['static_api_url'];
		$this->api_url        = $theme_data['private_api_url'];
		$this->theme_id       = $theme_data['theme_id'];
		$this->theme_version  = $theme_data['theme_version'];
	}

	/** The method will return a URL based on api base URL
	 *
	 * @var string $path The path to the file
	 * @return string The full URL path
	 */
	public function get_static_api_url( $path = '' ) {
		return $this->static_api_url . $path;
	}

	/** The method will return a URL based on api base URL
	 *
	 * @var string $path The path to the endpoint
	 * @return string The full URL path
	 */
	public function get_private_api_url( $path = '' ) {
		return $this->api_url . $path;
	}


	/**
	 * Unlinks the theme from hogash dashboard
	 *
	 * @return WP_Error|array
	 */
	public function unregister_theme() {
		return $this->request( 'theme/unregister' );
	}

	/**
	 * Make sure this is a valid api key format
	 * @param string $apiKey
	 * @return int
	 */
	public static function is_valid_api_key_format( $api_key ) {
		return preg_match( '/.{5}\-.{5}\-.{5}\-.{5}\-.{5}/iU', $api_key );
	}


	/**
	 * Register the theme with the API key
	 *
	 * @return WP_Error|array
	 */
	public function register_theme( $api_key ) {
		if ( ! self::is_valid_api_key_format( $api_key ) ) {
			return new \WP_Error( 'invalid_api_key', 'Invalid API key format' );
		}

		return $this->request(
			'theme/register',
			array(
				'license_key' => $api_key,
			)
		);
	}

	/**
	 * Will return the update version
	 *
	 * @return array|null
	 */
	public function get_update_version_info() {
		return $this->request_static_api( 'version.json' );
	}


	/**
	 * Will return the plugins list
	 *
	 * @return array|WP_Error
	 */
	public function get_plugins_list() {
		return $this->request_static_api( 'plugins.json' );
	}


	/**
	 * Will return the download URL
	 *
	 * @return string
	 */
	public function get_theme_download_url( $version ) {
		$response = $this->request(
			'theme/get-download-url',
			[
				'version' => $version,
			]
		);

		if ( is_wp_error( $response ) || ! isset( $response['download_url'] ) ) {
			return '';

		}

		return $response['download_url'];
	}


	/**
	 * Will make a request to the server
	 *
	 * @param string $endpoint The endpoint to request
	 * @param array $body_args The body arguments
	 * @return array|WP_Error
	 */
	public function request( $endpoint, $body_args = array() ) {
		// Server URL
		$server_url = $this->get_private_api_url() . $endpoint;
		$license    = isset( $body_args['license_key'] ) ? $body_args['license_key'] : License::get_license_key();

		// Check if the license was provided
		if ( ! $license ) {
			return new \WP_Error( 'no_license', 'No license key provided' );
		}

		// Check if the license is valid
		if ( ! self::is_valid_api_key_format( $license ) ) {
			return new \WP_Error( 'invalid_api_key', 'Invalid API key format' );
		}

		// Pass additional data
		$body_args['api_key']         = $license;
		$body_args['product_id']      = $this->theme_id;
		$body_args['site_url']        = esc_url( network_home_url( '/' ) );
		$body_args['current_version'] = $this->theme_version;

		$response = wp_remote_post(
			$server_url,
			array(
				'body' => $body_args,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		} elseif ( 200 !== wp_remote_retrieve_response_code( $response ) ) {
			$parsed_response = json_decode( wp_remote_retrieve_body( $response ), true );
			return new \WP_Error( 'server_error', $parsed_response['message'] );
		}

		return json_decode( wp_remote_retrieve_body( $response ), true );
	}

	/**
	 * Will make a request to the static API
	 *
	 * @param string $endpoint The endpoint to request
	 *
	 * @return array|WP_Error
	 */
	public function request_static_api( $endpoint ) {
		$response = wp_remote_get( $this->get_static_api_url( $endpoint ) );

		if ( is_wp_error( $response ) ) {
			return new \WP_Error( 'server_error', $response->get_error_message() );
		}

		$response        = wp_remote_retrieve_body( $response );
		$parsed_response = json_decode( $response, true );

		if ( null === $parsed_response ) {
			return new \WP_Error( 'server_error', 'Invalid server response' );
		}

		return $parsed_response;
	}

	/**
	 * Get demo list
	 */
	public function get_demos_list() {
		return $this->request_static_api( 'demos.json' );
	}

	/**
	 * Returns the download url for a demo
	 *
	 * @param string $demo_id The unique demo id
	 * @return string|WP_Error
	 */
	public function get_demo_download_url( $demo_id ) {
		$response = $this->request(
			'demos/get-download-url',
			array(
				'demo_id' => $demo_id,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( ! isset( $response['download_url'] ) ) {
			return new \WP_Error( 'server_error', 'Invalid server response' );
		}

		return $response['download_url'];
	}

	/**
	 * Returns the download url for a demo
	 *
	 * @param string $demo_id The unique demo id
	 * @return string|WP_Error
	 */
	public function get_plugin_download_url( $plugin_id ) {
		$response = $this->request(
			'plugins/get-download-url',
			array(
				'plugin_id' => $plugin_id,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		if ( ! isset( $response['download_url'] ) ) {
			return new \WP_Error( 'server_error', 'Invalid server response' );
		}

		return $response['download_url'];
	}
}
