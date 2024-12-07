import { TFunction } from 'i18next';
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

export function handleRegexInput(
    event: React.FormEvent<HTMLInputElement>, 
    regex: RegExp,
    fieldName: string,
    validationMessage: string,
    setHelperMessages: (value: React.SetStateAction<HelperMessages>) => void
) {
    const value = event.currentTarget.value;
    const isValid = (regex).test(value); 
    
    if (!isValid) {
        setHelperMessages(prev => ({
            ...prev,
            [fieldName]: {
                text: validationMessage,
                danger: true
            }
        }))
        event.preventDefault();
        return true;
    }
    setHelperMessages(prev => ({
        ...prev,
        [fieldName]: {
            text: validationMessage,
            danger: false
        }
    }))
    return false;
};

export function validateBirthDate(
    birthDay: string, 
    birthMonth: string, 
    birthYear: string,
    months: {
        value: string;
        content: string;
    }[],
    t: TFunction<[string, string], undefined>,
    setHelperMessages: (value: React.SetStateAction<HelperMessages>) => void
) {
    if (birthDay && birthMonth && birthYear) {
        const month = months.find(month => month.content === birthMonth);
        if (!month) {
            setHelperMessages(prev => ({
                ...prev,
                birthDate: {
                    text: t('registration.form.helper_texts.birth_date.error_texts.invalid'),
                    danger: true
                }
            }));
            return;
        }

        const dayFormatted = birthDay.length === 1 ? `0${birthDay}` : birthDay;
        const combinedDate = new Date(`${birthYear}-${month.value}-${dayFormatted}`);

        const isValidDate =
            combinedDate.getFullYear() === parseInt(birthYear) &&
            combinedDate.getMonth() + 1 === parseInt(month.value) &&
            combinedDate.getDate() === parseInt(dayFormatted);

        if (!isValidDate) {
            setHelperMessages(prev => ({
                ...prev,
                birthDate: {
                    text: t('registration.form.helper_texts.birth_date.error_texts.unreal'),
                    danger: true
                }
            }));
            return;
        }

        if (!isNaN(combinedDate.getTime())) {
            setHelperMessages(prev => ({
                ...prev,
                birthDate: undefined
            }));
            return combinedDate;
        } else {
            setHelperMessages(prev => ({
                ...prev,
                birthDate: {
                    text: t('registration.form.helper_texts.birth_date.error_texts.invalid'),
                    danger: true
                }
            }));
            return;
        }
    }
};

export function formatDateInString(inputString: string): string {
    const dateRegex = /([A-Za-z]{3} \w{3} \d{2} \d{4} \d{2}:\d{2}:\d{2} GMT[+-]\d{4} \([\w\s]+\))/;
  
    const match = inputString.match(dateRegex);
  
    if (match) {
      const date = new Date(match[0]);
  
      if (!isNaN(date.getTime())) {
        const options: Intl.DateTimeFormatOptions = {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          timeZoneName: 'short',
        };
  
        const formattedDate = date.toLocaleDateString('en-US', options);
  
        return inputString.replace(dateRegex, formattedDate);
      }
    }
  
    return inputString;
};