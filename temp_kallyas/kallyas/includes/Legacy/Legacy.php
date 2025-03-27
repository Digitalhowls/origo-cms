<?php

namespace Kallyas\Legacy;

if ( ! defined( 'ABSPATH' ) ) {
	return;
}

class Legacy {
	public function __construct() {
		require_once __DIR__ . '/HogashDashboard.php';
	}
}
