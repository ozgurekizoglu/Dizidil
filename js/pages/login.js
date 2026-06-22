import { state } from '../state.js?v=7';

export const loginTemplate = `
    <div class="screen login-screen">
        <div class="login-bg-shapes">
            <div class="shape shape-1"></div>
            <div class="shape shape-2"></div>
        </div>
        <div class="login-content">
            <div class="logo-container">
                <h1>Dizidil</h1>
                <p>The most fun way to learn Turkish</p>
            </div>
            
            <div class="auth-buttons">
                <button class="auth-btn google-btn">
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" style="width: 18px; height: 18px;">
                    Continue with Google
                </button>
                <button class="auth-btn apple-btn">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" alt="Apple" style="height: 20px; width: auto; filter: invert(1); object-fit: contain;">
                    Continue with Apple
                </button>
                <button class="auth-btn email-btn">
                    <i data-lucide="mail"></i>
                    Continue with Email
                </button>
            </div>
            
            <div class="login-footer">
                <p>By continuing, you agree to the <span>Terms of Use</span>.</p>
            </div>
        </div>
        <div class="loading-overlay" id="login-loading" style="display:none;">
            <i data-lucide="loader-2" class="spinner"></i>
            <p>Logging in...</p>
        </div>
    </div>
`;

export function setupLogin(container, navigateTo) {
    container.innerHTML = loginTemplate;
    
    if(window.lucide) window.lucide.createIcons();

    const buttons = container.querySelectorAll('.auth-btn');
    const loading = container.querySelector('#login-loading');

    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Show loading animation
            loading.style.display = 'flex';
            
            // Mock authentication delay (1.5 seconds)
            setTimeout(() => {
                state.login();
                navigateTo('home');
            }, 1500);
        });
    });
}
