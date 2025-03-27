<?php

namespace KallyasCore;

use KallyasCore\Admin\Admin;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Plugin {
	public function __construct() {
		new Admin();
	}
}
