/**
 * Watermark Protection Script
 * Detects screenshot attempts and makes watermark visible
 */
(function() {
    'use strict';
    
    const watermarkOverlay = document.querySelector('.watermark-overlay');
    if (!watermarkOverlay) return;
    
    // Watermark visibility state
    let isWatermarkVisible = false;
    const VISIBLE_OPACITY = 0.5; // Visible opacity when screenshot detected
    const BASE_OPACITY = 0.01;    // Very low opacity - invisible to eye but shows in screenshots
    const HIDDEN_OPACITY = 0.01;  // Base opacity (essentially invisible but captured in screenshots)
    
    // Function to show watermark
    function showWatermark() {
        if (!isWatermarkVisible) {
            isWatermarkVisible = true;
            watermarkOverlay.style.opacity = VISIBLE_OPACITY;
            watermarkOverlay.style.transition = 'opacity 0.1s ease-in';
        }
    }
    
    // Function to hide watermark (return to base opacity)
    function hideWatermark() {
        if (isWatermarkVisible) {
            isWatermarkVisible = false;
            watermarkOverlay.style.opacity = BASE_OPACITY;
            watermarkOverlay.style.transition = 'opacity 0.5s ease-out';
        }
    }
    
    // Keep watermark visible for a period after detection
    let hideTimeout;
    function showWatermarkTemporarily(duration = 2000) {
        showWatermark();
        clearTimeout(hideTimeout);
        hideTimeout = setTimeout(hideWatermark, duration);
    }
    
    // Detect Print Screen key
    document.addEventListener('keydown', function(e) {
        // Print Screen (Windows/Linux)
        if (e.key === 'PrintScreen' || e.keyCode === 44) {
            showWatermarkTemporarily(3000);
        }
        
        // Mac screenshot shortcuts: Cmd+Shift+3, Cmd+Shift+4, Cmd+Shift+5
        if (e.metaKey && e.shiftKey) {
            if (e.key === '3' || e.key === '4' || e.key === '5' || e.keyCode === 51 || e.keyCode === 52 || e.keyCode === 53) {
                showWatermarkTemporarily(3000);
            }
        }
        
        // Windows screenshot: Windows+Shift+S
        if (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) {
            showWatermarkTemporarily(3000);
        }
        
        // F12 (DevTools) - often used before screenshots
        if (e.key === 'F12' || e.keyCode === 123) {
            showWatermarkTemporarily(5000);
        }
    });
    
    // Detect copy operations (Ctrl+C, Cmd+C) - might be copying screenshots
    document.addEventListener('copy', function(e) {
        showWatermarkTemporarily(2000);
    });
    
    // Detect right-click context menu (might be saving image)
    document.addEventListener('contextmenu', function(e) {
        showWatermarkTemporarily(2000);
    });
    
    // Detect DevTools opening via keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U (view source)
        if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'i' || e.key === 'j')) {
            showWatermarkTemporarily(5000);
        }
        if (e.ctrlKey && e.key === 'u') {
            showWatermarkTemporarily(3000);
        }
    });
    
    // Detect window blur (user might be switching to screenshot tool)
    let blurTimeout;
    window.addEventListener('blur', function() {
        showWatermarkTemporarily(1000);
    });
    
    // Monitor for screenshot tools by detecting rapid visibility changes
    let lastVisibilityChange = Date.now();
    document.addEventListener('visibilitychange', function() {
        const now = Date.now();
        if (now - lastVisibilityChange < 500) {
            showWatermarkTemporarily(3000);
        }
        lastVisibilityChange = now;
    });
    
    // Detect attempts to disable JavaScript or inspect element
    // Monitor for common developer tools
    let devtools = {open: false};
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > 200 || 
            window.outerWidth - window.innerWidth > 200) {
            if (!devtools.open) {
                devtools.open = true;
                showWatermarkTemporarily(5000);
            }
        } else {
            devtools.open = false;
        }
    }, 500);
    
    // Keep watermark visible when page is not in focus (user might be taking screenshot)
    window.addEventListener('blur', function() {
        showWatermarkTemporarily(2000);
    });
    
    // Additional protection: Show watermark periodically in case of automated screenshots
    // This ensures watermark appears even if detection fails
    let periodicCheck = 0;
    setInterval(function() {
        periodicCheck++;
        // Every 30 seconds, briefly show watermark (very briefly, user won't notice)
        if (periodicCheck % 6 === 0) {
            const originalOpacity = watermarkOverlay.style.opacity;
            watermarkOverlay.style.opacity = '0.05';
            setTimeout(function() {
                if (!isWatermarkVisible) {
                    watermarkOverlay.style.opacity = originalOpacity || HIDDEN_OPACITY;
                }
            }, 50);
        }
    }, 5000);
    
    // Initialize watermark at base opacity (invisible to eye, but shows in screenshots)
    watermarkOverlay.style.opacity = BASE_OPACITY;
    
})();

