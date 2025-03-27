<?php

namespace Kallyas\Integrations;

// Prevent direct access
if ( ! defined( 'ABSPATH' ) ) {
	return;
}

/**
 * Interface IBaseIntegration
 *
 * @package Kallyas\Integrations
 */
interface IBaseIntegration {
	/**
	 * Get name
	 *
	 * returns the name of the integrations. This must be unique across integrations
	 *
	 * @return string
	 */
	public static function get_name();

	/**
	 * Can Load
	 *
	 * Performs basic checks to see if we can load this integrations
	 *
	 * @return boolean
	 */
	public static function can_load();
}
