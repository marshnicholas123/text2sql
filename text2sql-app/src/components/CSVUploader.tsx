'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, AlertCircle, Download, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { validateCSVFile, parseCSV, downloadSampleCSV, type CSVField, type CSVParseResult } from '@/lib/csvUtils'

interface CSVUploaderProps {
  onCSVParsed: (fields: CSVField[]) => void
  disabled?: boolean
}

export default function CSVUploader({ onCSVParsed, disabled = false }: CSVUploaderProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [parseResult, setParseResult] = useState<CSVParseResult | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || acceptedFiles.length === 0) return

    const file = acceptedFiles[0]
    setUploadedFile(file)
    setParseResult(null)
    setIsLoading(true)

    try {
      // First validate the file
      const fileValidation = validateCSVFile(file)
      if (!fileValidation.success) {
        setParseResult(fileValidation)
        setIsLoading(false)
        return
      }

      // Then parse the CSV
      const result = await parseCSV(file)
      setParseResult(result)

      if (result.success && result.data) {
        onCSVParsed(result.data)
      }
    } catch (error) {
      setParseResult({
        success: false,
        error: 'An unexpected error occurred while processing the file.',
        details: [error instanceof Error ? error.message : 'Unknown error'],
      })
    } finally {
      setIsLoading(false)
    }
  }, [onCSVParsed, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
    },
    maxFiles: 1,
    disabled: disabled || isLoading,
  })

  const resetUploader = () => {
    setUploadedFile(null)
    setParseResult(null)
  }

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <Card className={cn(
        "border-2 border-dashed transition-colors",
        isDragActive && "border-primary bg-primary/5",
        disabled && "opacity-50 cursor-not-allowed",
        parseResult?.success && "border-green-300 bg-green-50",
        parseResult && !parseResult.success && "border-destructive bg-destructive/5"
      )}>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "text-center cursor-pointer",
              disabled && "cursor-not-allowed"
            )}
          >
            <input {...getInputProps()} />
            
            {isLoading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-muted-foreground">Processing CSV file...</p>
              </div>
            ) : uploadedFile && parseResult?.success ? (
              <div className="flex flex-col items-center space-y-2">
                <Check className="w-8 h-8 text-green-600" />
                <p className="font-medium text-green-800">
                  CSV uploaded successfully!
                </p>
                <p className="text-sm text-muted-foreground">
                  {uploadedFile.name} • {parseResult.data?.length} fields imported
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    resetUploader()
                  }}
                >
                  Upload Different File
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="font-medium">
                  {isDragActive ? 'Drop your CSV file here' : 'Drag & drop your CSV file here'}
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to browse files
                </p>
                <div className="text-xs text-muted-foreground mt-2">
                  <p>• CSV format only</p>
                  <p>• Maximum file size: 1MB</p>
                  <p>• Maximum 50 fields</p>
                  <p>• Required columns: field_name, field_description</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {parseResult && !parseResult.success && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-destructive">
                  {parseResult.error}
                </p>
                {parseResult.details && parseResult.details.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Details:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {parseResult.details.map((detail, index) => (
                        <li key={index} className="ml-2">• {detail}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={resetUploader}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample CSV Download */}
      <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
        <div className="flex items-center space-x-2">
          <File className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Need an example? Download our sample CSV template
          </span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={downloadSampleCSV}
        >
          <Download className="w-4 h-4 mr-2" />
          Download Sample
        </Button>
      </div>
    </div>
  )
}