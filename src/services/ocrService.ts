// OCR Service for document processing
import { apiConfig, getOCRHeaders } from '../config/apiConfig';

export interface OCRConfig {
  dmsBaseUrl: string;
  csrfToken: string;
  sessionId: string;
  llmApiKey: string;
  llmUrl: string;
}

export interface OCRResult {
  success: boolean;
  text?: string;
  structuredData?: any;
  error?: string;
}

export interface NationalIDData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: string;
  nationalId: string;
}

export class OCRService {
  private config: OCRConfig;
  private formatTemplate: NationalIDData = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    gender: "",
    dateOfBirth: "",
    nationalId: ""
  };

  constructor(config: OCRConfig) {
    this.config = config;
  }

  private cleanOCRText(text: string): string {
    const corrections: Record<string, string> = {
      '\\$': 's',
      '@': 'a',
      '§': 'S',
      '"': '"',
      '"': '"',
      "'": "'",
      "'": "'"
    };

    let cleanedText = text;
    for (const [pattern, replacement] of Object.entries(corrections)) {
      cleanedText = cleanedText.replace(new RegExp(pattern, 'g'), replacement);
    }

    return cleanedText.trim();
  }

  async uploadDocument(file: File): Promise<string | null> {
    const url = `${this.config.dmsBaseUrl}/api/documents/post_document/`;
    
    const formData = new FormData();
    formData.append('document', file);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getOCRHeaders(),
        credentials: 'include',
        body: formData
      });

      if (response.ok) {
        const taskId = await response.text();
        return taskId.trim().replace(/"/g, '');
      }
      return null;
    } catch (error) {
      console.error('Document upload failed:', error);
      return null;
    }
  }

  async getRelatedDocument(taskId: string, fileName: string, maxAttempts: number = 20): Promise<string | null> {
    const url = `${this.config.dmsBaseUrl}/api/tasks/`;
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: getOCRHeaders(),
          credentials: 'include'
        });

        if (response.ok) {
          const tasks = await response.json();
          
          // Filter for SUCCESS status and matching filename
          const successfulTasks = tasks.filter((task: any) => 
            task.status === 'SUCCESS' && 
            task.task_file_name === fileName
          );
          
          // Check if we have any successful tasks for this file
          if (successfulTasks.length > 0) {
            // Get the most recent successful task (highest ID)
            const latestTask = successfulTasks.reduce((latest: any, current: any) => 
              current.id > latest.id ? current : latest
            );
            
            if (latestTask.related_document) {
              console.log(`Found successful task for ${fileName}:`, {
                taskId: latestTask.task_id,
                relatedDocument: latestTask.related_document,
                status: latestTask.status,
                result: latestTask.result
              });
              return latestTask.related_document;
            }
          }
          
          // Check if our specific task failed
          const ourTask = tasks.find((t: any) => t.task_id === taskId);
          if (ourTask && ourTask.status === 'FAILURE') {
            console.error('OCR Task Failed:', ourTask.result);
            return null;
          }
        }
        
        // Wait 5 seconds before next attempt
        await new Promise(resolve => setTimeout(resolve, 5000));
      } catch (error) {
        console.error('Error checking task status:', error);
      }
    }
    
    console.error(`Failed to find successful OCR task for ${fileName} after ${maxAttempts} attempts`);
    return null;
  }

  async retrieveDocumentContent(documentId: string): Promise<string | null> {
    const url = `${this.config.dmsBaseUrl}/api/documents/${documentId}/?full_perms=true`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: getOCRHeaders(),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.content || '';
        const cleanedContent = this.cleanOCRText(content);
        console.log('Retrieved and cleaned document content:', cleanedContent.substring(0, 200) + '...');
        return cleanedContent;
      } else {
        console.error('Failed to retrieve document content:', response.status, response.statusText);
      }
      return null;
    } catch (error) {
      console.error('Error retrieving document content:', error);
      return null;
    }
  }

  async getLLMResponse(content: string): Promise<any | null> {
    try {
      const payload = {
        context: "You are an AI that extracts structured data from OCR text of national ID documents. Extract the following specific fields for a government ID registration form. Return only valid JSON with the exact structure provided in formatTemplate. Instructions: firstName: Extract the person's first name/given name, lastName: Extract the person's last name/family name/surname, email: Extract email address if present (usually not on ID cards, leave empty if not found). If it looks like a partial email (missing '@' or domain), attempt to intelligently infer and reconstruct it as a valid email format, phone: Extract phone number if present (usually not on ID cards, leave empty if not found), gender: Extract gender (Male/Female/Other) - look for M/F or full words, dateOfBirth: Extract date of birth in YYYY-MM-DD format (convert from any date format found), nationalId: Extract the National ID number/card number/identification number. Important: If a field is not found in the document, leave it as an empty string. For dates, convert to YYYY-MM-DD format regardless of original format. For gender, standardize to 'Male', 'Female', or 'Other'. Be very careful to extract the correct National ID number (not other numbers). Return only the JSON object, no additional text or explanations.",
        content: content,
        formatTemplate: this.formatTemplate
      };

      const response = await fetch(this.config.llmUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.llmApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const data = await response.json();
        console.log('LLM API response:', data);
        
        // The API should return the structured data directly
        if (data && typeof data === 'object') {
          // Validate that we have the expected structure
          const validatedData: NationalIDData = {
            firstName: data.firstName || '',
            lastName: data.lastName || '',
            email: data.email || '',
            phone: data.phone || '',
            gender: data.gender || '',
            dateOfBirth: data.dateOfBirth || '',
            nationalId: data.nationalId || ''
          };
          
          console.log('Structured National ID Data:', JSON.stringify(validatedData, null, 2));
          return validatedData;
        } else {
          console.error('Unexpected response format from LLM API:', data);
          return null;
        }
      } else {
        console.error('LLM API call failed:', response.status);
        const errorText = await response.text();
        console.error('Error response:', errorText);
        return null;
      }
    } catch (error) {
      console.error('LLM API error:', error);
      return null;
    }
  }

  async processDocument(file: File, onProgress?: (message: string) => void): Promise<OCRResult> {
    try {
      onProgress?.('Uploading document...');
      const taskId = await this.uploadDocument(file);
      
      if (!taskId) {
        return { success: false, error: 'Failed to upload document' };
      }

      console.log(`Document uploaded successfully. Task ID: ${taskId}, File: ${file.name}`);

      onProgress?.('Processing OCR...');
      const relatedDocId = await this.getRelatedDocument(taskId, file.name);
      
      if (!relatedDocId) {
        return { success: false, error: 'OCR processing failed or timed out' };
      }

      console.log(`OCR completed successfully. Related document ID: ${relatedDocId}`);

      onProgress?.('Extracting text...');
      const extractedText = await this.retrieveDocumentContent(relatedDocId);
      
      if (!extractedText) {
        return { success: false, error: 'Failed to extract text from document' };
      }

      onProgress?.('Processing with AI to extract National ID data...');
      const structuredData = await this.getLLMResponse(extractedText);

      if (!structuredData) {
        console.warn('LLM processing failed, but OCR was successful');
        return { 
          success: true, 
          text: extractedText,
          error: 'AI processing failed, but text extraction was successful'
        };
      }

      return { 
        success: true, 
        text: extractedText,
        structuredData: structuredData
      };
    } catch (error) {
      console.error('OCR processing error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      };
    }
  }
}

// Default OCR configuration using centralized config
export const defaultOCRConfig: OCRConfig = {
  dmsBaseUrl: apiConfig.ocr.dmsBaseUrl,
  csrfToken: apiConfig.ocr.csrfToken,
  sessionId: apiConfig.ocr.sessionId,
  llmApiKey: apiConfig.llm.apiKey,
  llmUrl: apiConfig.llm.baseUrl
};