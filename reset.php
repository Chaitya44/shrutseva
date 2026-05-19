<?php
if (function_exists('opcache_reset')) {
    if (opcache_reset()) {
        echo "OPCache reset successfully!";
    } else {
        echo "OPCache reset failed.";
    }
} else {
    echo "OPCache not loaded.";
}
