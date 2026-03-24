export type FileType = 'html' | 'css' | 'js';

export type ViewMode = 'single' | 'multi';

export type PreviewLayout = 'horizontal' | 'vertical';

export interface CodeFile {
    id: string;
    name: string;
    type: FileType;
    content: string;
}

export interface HtmlViewerState {
    viewMode: ViewMode;
    activeFileId: string;
    files: CodeFile[];
    singleFileContent: string;
    previewLayout: PreviewLayout;
    autoRefresh: boolean;
}
