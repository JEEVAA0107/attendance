import * as XLSX from 'xlsx';
import { toast } from 'sonner';

export const handleExcelUpload = (
  file: File,
  onSuccess: (data: any[]) => void,
  onError?: (error: string) => void
) => {
  const reader = new FileReader();
  
  reader.onload = (e) => {
    try {
      const data = e.target?.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        blankrows: false
      }) as any[][];

      if (jsonData.length < 1) {
        const errorMsg = 'File is empty or has no data';
        onError?.(errorMsg);
        toast.error(errorMsg);
        return;
      }

      onSuccess(jsonData);
    } catch (error) {
      const errorMsg = 'Error reading file. Please ensure it\'s a valid Excel file.';
      onError?.(errorMsg);
      toast.error(errorMsg);
    }
  };
  
  reader.readAsArrayBuffer(file);
};