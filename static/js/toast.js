class Toast {
    constructor() {
        this.container = document.querySelector('.notifications');

        if (!this.container) {
            this.container = $.create('ul', {
                className: 'notifications'
            });

            $.append(document.body, this.container);
        }

        this.defaults = {
            timer: 5000,
            pos: 'top-right',

            success: {
                icon: '🎉',
                text: 'Success'
            },

            error: {
                icon: '🚫',
                text: 'Error'
            },

            warning: {
                icon: '⚠️',
                text: 'Warning'
            },

            info: {
                icon: '💡',
                text: 'Information'
            }
        };
    }

    applyPosition(pos) {
        const positions = {
            'top-left': {
                top: '60px',
                left: '0',
                right: '',
                bottom: '',
                transform: ''
            },

            'top-center': {
                top: '60px',
                left: '50%',
                right: '',
                bottom: '',
                transform: 'translateX(-50%)'
            },

            'top-right': {
                top: '60px',
                right: '0',
                left: '',
                bottom: '',
                transform: ''
            },

            'bottom-left': {
                bottom: '20px',
                left: '0',
                top: '',
                right: '',
                transform: ''
            },

            'bottom-center': {
                bottom: '20px',
                left: '50%',
                top: '',
                right: '',
                transform: 'translateX(-50%)'
            },

            'bottom-right': {
                bottom: '20px',
                right: '0',
                top: '',
                left: '',
                transform: ''
            },

            'left-center': {
                top: '50%',
                left: '0',
                right: '',
                bottom: '',
                transform: 'translateY(-50%)'
            },

            'right-center': {
                top: '50%',
                right: '0',
                left: '',
                bottom: '',
                transform: 'translateY(-50%)'
            },

            'middle': {
                top: '50%',
                left: '50%',
                right: '',
                bottom: '',
                transform: 'translate(-50%, -50%)'
            }
        };

        $.css(
            this.container,
            positions[pos] || positions['top-right']
        );
    }

    removeToast(toast) {
        $.addClass(toast, 'hide-toast');

        clearTimeout(toast.timeoutId);

        setTimeout(() => {
            $.remove(toast);
        }, 300);
    }

    createToast(options = {}) {
        const type = options.type || 'info';

        const config = {
            timer: this.defaults.timer,
            ...this.defaults[type],
            ...options
        };

        this.applyPosition(
            config.pos || this.defaults.pos
        );

        const toast = $.create('li', {
            className: `toast ${type}`
        });

        let directionClass = 'toast-r';

        if (
            ['top-left', 'bottom-left', 'left-center']
                .includes(config.pos)
        ) {
            directionClass = 'toast-l';
        }
        else if (
            ['top-center', 'bottom-center', 'middle']
                .includes(config.pos)
        ) {
            directionClass = 'toast-m';
        }

        $.addClass(toast, directionClass);

        toast.innerHTML = `
            <div class="column">
                <span class="toast-icon">${config.icon}</span>
                <span class="toast-message">${config.text}</span>
                <span class="close">&times;</span>
            </div>
            <div class="indicator"></div>
        `;

        $.append(this.container, toast);

        const indicator = toast.querySelector('.indicator');

        indicator.style.width = '100%';
        indicator.offsetWidth;
        indicator.style.transition =
            `width ${config.timer}ms linear`;

        requestAnimationFrame(() => {
            indicator.style.width = '0%';
        });

        const closeBtn =
            toast.querySelector('.close');

        $.on(closeBtn, 'click', () => {
            this.removeToast(toast);
        });

        const startTimer = () => {
            toast.timeoutId = setTimeout(() => {
                this.removeToast(toast);
            }, config.timer);
        };

        startTimer();

        $.on(toast, 'mouseenter', () => {
            clearTimeout(toast.timeoutId);
            indicator.style.transition = 'none';
            indicator.style.width = '100%';

        });

        $.on(toast, 'mouseleave', () => {

            requestAnimationFrame(() => {
                indicator.style.transition =
                    `width ${config.timer}ms linear`;

                indicator.style.width = '0%';
            });
            startTimer();
        });

        return toast;
    }
}

const toastManager = new Toast();

const toast = {
    show(options) {
        return toastManager.createToast(options);
    },

    success(text, options = {}) {
        return this.show({
            type: 'success',
            text,
            ...options
        });
    },

    error(text, options = {}) {
        return this.show({
            type: 'error',
            text,
            ...options
        });
    },

    warning(text, options = {}) {
        return this.show({
            type: 'warning',
            text,
            ...options
        });
    },

    info(text, options = {}) {
        return this.show({
            type: 'info',
            text,
            ...options
        });
    }
};

//toast.success("Profile updated")//, {timer: 9000});

