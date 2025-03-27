<?php

namespace KallyasCore\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Admin {
	public function __construct() {
		add_action( 'kallyas/admin/enqueue_scripts', array( $this, 'enqueue_scripts' ) );
	}

	public function enqueue_scripts() {
		wp_enqueue_script( 'kallyas-admin', KALLYAS_CORE_URI . 'dist/admin-page.js', array( 'jquery' ), KALLYAS_CORE_VERSION, true );
	}
}
