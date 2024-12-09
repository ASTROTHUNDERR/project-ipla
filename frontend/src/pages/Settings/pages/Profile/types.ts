export type UploadedImage = { part: 'banner' | 'avatar', imageSrc: string }; 

export type WindowPopupData = {
    width: number;
    header: string;
    content: string | React.ReactNode;
    cancelButton?: boolean;
    cancelButtonText?: string | React.ReactNode;
    cancelButtonOnClick?: React.MouseEventHandler<HTMLButtonElement>;
    submitLoading?: boolean;
    dangerSubmitButton?: boolean;
    submitButtonInnerElement: string | React.ReactNode;
    onFormSubmit: React.FormEventHandler<HTMLFormElement>;
};