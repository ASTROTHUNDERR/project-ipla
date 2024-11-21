import React from 'react';

import { ReactComponent as ChevronDownIcon } from '../../assets/icons/chevron-down.svg';

type Option = {
    value: string;
    content: string;
}

type Props = {
    selectId?: string;
    selectClassName: string;
    selectStyle?: React.CSSProperties;
    optionsStyle?: React.CSSProperties;
    optionsWrapperClassname: string;
    optionClassname: string;
    options?: Option[];
    defaultValue?: string;
    selectedValue: string | null;
    onOptionClick: React.MouseEventHandler<HTMLDivElement | null>;
}

export default function Selection({
    selectId,
    selectClassName,
    selectStyle,
    defaultValue,
    selectedValue,
    optionsStyle,
    options,
    optionsWrapperClassname,
    optionClassname,
    onOptionClick
}: Props) {
    const [optionsState, setOptionsState] = React.useState(false);
    const selectRef = React.useRef<HTMLDivElement | null>(null);
    const optionsWrapperRef = React.useRef<HTMLDivElement | null>(null);

    React.useEffect(() => {
        function onDocumentClick(event: Event) {
            if (
                selectRef.current && !selectRef.current.contains(event.target as Node)
                && optionsWrapperRef.current && !optionsWrapperRef.current.contains(event.target as Node)
            ) {
                setOptionsState(false);
            }
        }

        document.addEventListener('mousedown', onDocumentClick);

        return () => {
            document.removeEventListener('mousedown', onDocumentClick);
        }
    }, [])

    return (
        <div className='flex column relative'>
            <div 
                ref={selectRef}
                id={selectId}
                style={{
                    ...selectStyle,
                    userSelect: 'none'
                }}
                className={`${selectClassName} flex items-center space-between`}
                onClick={() => setOptionsState(!optionsState)}
            >
                {defaultValue && !selectedValue ? (
                    <span style={{ color: 'var(--secondary-200)' }}>{defaultValue}</span>
                ) : (
                    <span>{selectedValue}</span>
                )}
                <div 
                    className='flex items-center' 
                    style={{ 
                        transition: 'transform 300ms',
                        ...optionsState 
                            ? { transform: 'rotate(-180deg)' }
                            : {}
                    }}
                >
                    <ChevronDownIcon width={16} height={16} />
                </div>
            </div>
            {optionsState && (
                <div 
                    ref={optionsWrapperRef}
                    style={{
                        ...optionsStyle,
                        width: '100%',
                        top: '100%',
                        position: 'absolute'
                    }}
                    className={`${optionsWrapperClassname} z-2`}
                >
                    {options?.map((option, index) => (
                        <div
                            key={index} 
                            className={optionClassname} 
                            style={{ cursor: 'pointer' }}
                            data-value={option.value}
                            onClick={(e) => {
                                onOptionClick(e);
                                setOptionsState(false);
                            }}
                        >
                            {option.content}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
};