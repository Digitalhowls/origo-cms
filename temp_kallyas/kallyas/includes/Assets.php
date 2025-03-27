<?php

namespace Kallyas;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Assets {
	const DYNAMIC_CSS_FILE_NAME = 'dynamic.css';

	/**
	 * Holds a reference to the dynamic css file path
	 */
	private $dynamic_css_file_path = '';

	/**
	 * Holds a reference to the dynamic css file url
	 */
	private $dynamic_css_file_url = '';

	private $inline_js = [];

	public function __construct() {
		// Generated css file - The options needs to be saved in order to generate new file
		$uploads = wp_upload_dir();

		// Set the defaults
		$this->dynamic_css_file_path = trailingslashit( $uploads['basedir'] ) . self::DYNAMIC_CSS_FILE_NAME;
		$this->dynamic_css_file_url  = trailingslashit( $uploads['baseurl'] ) . self::DYNAMIC_CSS_FILE_NAME;

		// Add actions
		add_action( 'wp_footer', array( $this, 'output_inline_js' ), 25 );
		add_action( 'wp_head', array( $this, 'output_inline_css' ), 25 );
		add_action( 'after_switch_theme', array( $this, 'deleteDynamicCss' ) );
		add_action( 'activated_plugin', array( $this, 'deleteDynamicCss' ) );
		add_action( 'znhgfw_domain_change', 'deleteDynamicCss' );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_dynamic_style' ), 99 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	/**
	 * Outputs the inline javascript
	 */
	public function output_inline_js() {
		if ( ! empty( $this->inline_js ) && is_array( $this->inline_js ) ) {
			echo '<!-- Zn Framework inline JavaScript-->';
			echo '<script type="text/javascript">';
			echo 'jQuery(document).ready(function($) {';
			foreach ( $this->inline_js as $code ) {
				echo $code;
			}
			echo '});';
			echo '</script>';
		}
	}
}
