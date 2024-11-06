import { HelperMessages } from "./types";

export function capitalizeWords(str: string | null) {
    if (!str) return '';
    return str
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
};

function expandWrapper(element: HTMLDivElement, duration = 300) {
    const fullHeight = element.scrollHeight;
    const startTime = performance.now();

    element.style.height = '0px';
    element.style.overflow = 'hidden';
    element.style.opacity = '1';

    function animate(time: number) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3);

        element.style.height = `${ease * fullHeight}px`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.height = 'auto';
        }
    }

    requestAnimationFrame(animate);
};

function collapseWrapper(element: HTMLDivElement, duration = 300) {
    const fullHeight = element.scrollHeight;
    const startTime = performance.now();

    element.style.height = `${fullHeight}px`;
    element.style.overflow = 'hidden';

    function animate(time: number) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - Math.pow(progress, 3);

        element.style.height = `${ease * fullHeight}px`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            element.style.height = '0px';
            element.style.opacity = '0';
        }
    }

    requestAnimationFrame(animate);
};

export function handleInputOnFocus(e: React.FocusEvent<HTMLInputElement>) {
    const parentElement = e.currentTarget.parentElement;
    const helperWrapper = parentElement?.querySelector('.field-input-helper-wrapper');
    const helper = parentElement?.querySelector('.field-input-helper');

    if (
        helperWrapper && helper
        && helperWrapper instanceof HTMLDivElement
        && helper instanceof HTMLSpanElement
    ) {
        helper.classList.remove('helper-collapse');
        helper.classList.add('helper-expand');
        expandWrapper(helperWrapper);
    }
    // helperWrapper?.classList.remove(styles['helper-wrapper-collapse']);
    // helperWrapper?.classList.add(styles['helper-wrapper-expand']);
};


export function handleInputOnBlur(e: React.FocusEvent<HTMLInputElement>) {
    const parentElement = e.currentTarget.parentElement;
    const helperWrapper = parentElement?.querySelector('.field-input-helper-wrapper');
    const helper = parentElement?.querySelector('.field-input-helper');
    
    if (
        helperWrapper && helper
        && helperWrapper instanceof HTMLDivElement
        && helper instanceof HTMLSpanElement
    ) {
        helper.classList.add('helper-collapse');
        helper.classList.remove('helper-expand');
        collapseWrapper(helperWrapper);
    }
    // helperWrapper?.classList.remove(styles['helper-wrapper-expand']);
    // helperWrapper?.classList.add(styles['helper-wrapper-collapse']);
};

export function handleUsernameInput(
    event: React.FormEvent<HTMLInputElement>, 
    text: string,
    setHelperMessages: (value: React.SetStateAction<HelperMessages>) => void
) {
    const value = event.currentTarget.value;
    const isValid = /^[a-zA-Z0-9_]*$/.test(value); 
    
    if (!isValid) {
        setHelperMessages(prev => ({
            ...prev,
            username: {
                text: text, danger: true
            }
        }))
        event.preventDefault();
        return true;
    }
    setHelperMessages(prev => ({
        ...prev,
        username: {
            text: text, danger: false
        }
    }))
    return false;
};