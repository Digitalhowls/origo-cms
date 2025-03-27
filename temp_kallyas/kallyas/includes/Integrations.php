<?php

namespace Kallyas;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Class Integrations
 *
 * Modules manager
 *
 * Will handle all integrations with the WordPress admin area and the page builder
 *
 * @package Kallyas
 */
class Integrations {
	/**
	 * Holds the integrations that needs to be loaded
	 *
	 * @var array The registered integrations
	 *
	 * @since  1.0.0
	 */
	private $registered_integrations = [];

	/**
	 * Holds integrations that where already loaded
	 *
	 * @var array
	 *
	 * @since  1.0.0
	 */
	public $loaded_integrations = [];

	/**
	 * Main class constructor
	 *
	 * @throws \Exception
	 * @since  1.0.0
	 */
	public function __construct() {

		// Load default integrations
		$this->register_default_integrations();

		// Allow other to load integrations
		do_action( 'kallyas/integrations/init', $this );

		// Try to initialize integrations
		$this->init_integrations();
	}

	/**
	 * Will register the default integrations provided by the plugin
	 *
	 * @throws \Exception
	 * @since  1.0.0
	 */
	private function register_default_integrations() {
		$this->register_integration( 'Kallyas\Integrations\Polylang' );
		$this->register_integration( 'Kallyas\Integrations\WPML' );
	}

	/**
	 * Will try to load the integrations if can_load permits it
	 *
	 * @since  1.0.0
	 */
	private function init_integrations() {
		// Allow other to load integrations
		do_action( 'kallyas/integrations/before_init', $this );

		foreach ( $this->registered_integrations as $integration_name => $integration_class ) {
			$this->loaded_integrations[ $integration_name ] = new $integration_class();
		}

		// Remove the registered integrations
		$this->registered_integrations = [];
	}

	/**
	 * Will register a new integration
	 *
	 * @param string $integration_class Integration class name
	 *
	 * @since  1.0.0
	 * @throws \Exception
	 */
	public function register_integration( $integration_class ) {
		// Only add if the integration extends our base integration class
		if ( is_subclass_of( $integration_class, 'Kallyas\Integrations\IBaseIntegration' ) ) {
			if ( call_user_func( [ $integration_class, 'can_load' ] ) ) {
				$integration_name                                   = call_user_func( [ $integration_class, 'get_name' ] );
				$this->registered_integrations[ $integration_name ] = $integration_class;
			}
		} else {
			throw new \Exception( esc_html__( 'The integration must implement IBaseIntegration', 'kallyas' ) );
		}
	}

	/**
	 * Will unregister an integration
	 *
	 * @param string $integration_name The integration name you want to remove
	 *
	 * @since  1.0.0
	 */
	public function unregister_integration( $integration_name ) {
		unset( $this->registered_integrations[ $integration_name ] );
	}

	/**
	 * @param string $integration_name
	 *
	 * @return mixed
	 */
	public function get_integration( $integration_name ) {
		return isset( $this->loaded_integrations[ $integration_name ] ) ? $this->loaded_integrations[ $integration_name ] : false;
	}
}
