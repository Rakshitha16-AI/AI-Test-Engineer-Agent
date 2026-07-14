import { createContext, useContext, useState, useCallback } from "react";

interface DocumentContextType {
  fileName: string;
  fileContent: string;
  hasDocument: boolean;
  setDocument: (fileName: string, fileContent: string) => void;
  clearDocument: () => void;
}

const DocumentContext = createContext<DocumentContextType>({
  fileName: "",
  fileContent: "",
  hasDocument: false,
  setDocument: () => {},
  clearDocument: () => {},
});

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");

  const setDocument = useCallback((name: string, content: string) => {
    setFileName(name);
    setFileContent(content);
  }, []);

  const clearDocument = useCallback(() => {
    setFileName("");
    setFileContent("");
  }, []);

  return (
    <DocumentContext.Provider
      value={{
        fileName,
        fileContent,
        hasDocument: fileContent.length > 0,
        setDocument,
        clearDocument,
      }}
    >
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  return useContext(DocumentContext);
}
