import Papa from 'papaparse'
import { z } from 'zod'

export interface CSVField {
  field_name: string
  field_description: string
}

export interface CSVParseResult {
  success: boolean
  data?: CSVField[]
  error?: string
  details?: string[]
}

// Validation schema for CSV field
const csvFieldSchema = z.object({
  field_name: z.string().min(1, 'Field name is required').regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/, 'Invalid field name format'),
  field_description: z.string().min(1, 'Field description is required'),
})

// Constants
const MAX_FILE_SIZE = 1024 * 1024 // 1MB
const MAX_FIELDS = 50
const REQUIRED_HEADERS = ['field_name', 'field_description']

export function validateCSVFile(file: File): CSVParseResult {
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      error: 'File too large. Maximum size is 1MB.',
    }
  }

  // Check file type
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    return {
      success: false,
      error: 'Invalid file format. Please upload a CSV file.',
    }
  }

  return { success: true }
}

export function parseCSV(file: File): Promise<CSVParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parseResult = validateCSVData(results)
          resolve(parseResult)
        } catch (error) {
          resolve({
            success: false,
            error: 'Failed to parse CSV file.',
            details: [error instanceof Error ? error.message : 'Unknown error'],
          })
        }
      },
      error: (error) => {
        resolve({
          success: false,
          error: 'Failed to parse CSV file.',
          details: [error.message],
        })
      },
    })
  })
}

function validateCSVData(results: Papa.ParseResult<Record<string, string>>): CSVParseResult {
  const { data, errors, meta } = results

  // Check for parsing errors
  if (errors.length > 0) {
    return {
      success: false,
      error: 'CSV parsing errors detected.',
      details: errors.map(err => `Row ${err.row}: ${err.message}`),
    }
  }

  // Check headers
  if (!meta.fields || meta.fields.length !== 2) {
    return {
      success: false,
      error: 'Invalid CSV format. Expected exactly 2 columns: field_name, field_description.',
    }
  }

  const headers = meta.fields.map(h => h.toLowerCase().trim())
  const missingHeaders = REQUIRED_HEADERS.filter(required => 
    !headers.includes(required.toLowerCase())
  )

  if (missingHeaders.length > 0) {
    return {
      success: false,
      error: `Missing required headers: ${missingHeaders.join(', ')}`,
    }
  }

  // Validate data
  if (!data || data.length === 0) {
    return {
      success: false,
      error: 'CSV file is empty or contains no valid data.',
    }
  }

  if (data.length > MAX_FIELDS) {
    return {
      success: false,
      error: `Maximum ${MAX_FIELDS} fields allowed. Found ${data.length} fields.`,
    }
  }

  const validationErrors: string[] = []
  const validatedFields: CSVField[] = []
  const seenFieldNames = new Set<string>()

  data.forEach((row, index) => {
    try {
      // Normalize the row keys to handle case variations
      const normalizedRow = {
        field_name: row.field_name || row.Field_Name || row['Field Name'] || '',
        field_description: row.field_description || row.Field_Description || row['Field Description'] || '',
      }

      // Validate the field
      const validatedField = csvFieldSchema.parse(normalizedRow)

      // Check for duplicates
      if (seenFieldNames.has(validatedField.field_name.toLowerCase())) {
        validationErrors.push(`Row ${index + 2}: Duplicate field name '${validatedField.field_name}'`)
        return
      }

      seenFieldNames.add(validatedField.field_name.toLowerCase())
      validatedFields.push(validatedField)
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.issues.forEach(issue => {
          validationErrors.push(`Row ${index + 2}: ${issue.message}`)
        })
      } else {
        validationErrors.push(`Row ${index + 2}: Invalid data format`)
      }
    }
  })

  if (validationErrors.length > 0) {
    return {
      success: false,
      error: 'Validation errors found in CSV data.',
      details: validationErrors,
    }
  }

  if (validatedFields.length === 0) {
    return {
      success: false,
      error: 'No valid fields found in CSV data.',
    }
  }

  return {
    success: true,
    data: validatedFields,
  }
}

export function generateSampleCSV(): string {
  const sampleData = [
    { field_name: 'id', field_description: 'Unique identifier for the record' },
    { field_name: 'name', field_description: 'Full name of the entity' },
    { field_name: 'email', field_description: 'Email address' },
    { field_name: 'phone', field_description: 'Phone number' },
    { field_name: 'created_at', field_description: 'When the record was created' },
    { field_name: 'updated_at', field_description: 'When the record was last modified' },
    { field_name: 'is_active', field_description: 'Whether the record is currently active' },
  ]

  return Papa.unparse(sampleData)
}

export function downloadSampleCSV(): void {
  const csvContent = generateSampleCSV()
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'sample_schema_fields.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}