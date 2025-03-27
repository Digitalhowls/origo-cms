<?php

namespace Kallyas\Api;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Class RestApi
 */
class RestApi {

	/**
	 * Holds a reference to all rest controllers classes
	 *
	 * @var array
	 */
	private $controllers = [];


	/**
	 * RestApi constructor.
	 */
	public function __construct() {
		add_action( 'rest_api_init', [ $this, 'init_controllers' ] );
	}

	/**
	 * Initialize the registered controllers
	 *
	 * @return void
	 */
	public function init_controllers() {
		$this->register_default_controllers();

		do_action( 'kallyas/rest_api/register_controllers', $this );

		foreach ( $this->get_controllers() as $controller ) {
			$controller->init();
		}
	}

	/**
	 * Registers a new Rest API controller
	 *
	 * @param RestApiController $controller_instance
	 *
	 * @return void
	 */
	public function register_controller( $controller_instance ) {
		$this->controllers[ $controller_instance->get_controller_id() ] = $controller_instance;
	}

	/**
	 * Get Controllers
	 *
	 * Returns all registers Rest Api controllers
	 *
	 * @return array
	 */
	public function get_controllers() {
		return $this->controllers;
	}

	/**
	 * Register the plugin's default controllers
	 *
	 * @return void
	 */
	public function register_default_controllers() {
		$controllers = [
			'Kallyas\Api\RestControllers\Theme',
			'Kallyas\Api\RestControllers\Plugins',
			'Kallyas\Api\RestControllers\Demos',
		];

		foreach ( $controllers as $controller ) {
			$this->register_controller( new $controller() );
		}
	}
}
