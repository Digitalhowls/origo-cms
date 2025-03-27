<?php

if ( ! defined( 'ABSPATH' ) ) {
	return;
}


define( 'KALLYAS_CORE_URI', get_template_directory_uri() . '/kallyas-core/' );
define( 'KALLYAS_CORE_VERSION', '1.0.0' );

// Load auto loader
require __DIR__ . '/vendor/autoload.php';

new KallyasCore\Plugin();
