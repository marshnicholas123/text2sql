import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const fieldSchema = z.object({
  field_name: z.string().min(1),
  field_description: z.string().min(1),
  data_type: z.enum(['VARCHAR', 'INT', 'BIGINT', 'DECIMAL', 'BOOLEAN', 'DATE', 'DATETIME', 'TEXT', 'JSON']).optional(),
  max_length: z.number().optional(),
  is_nullable: z.boolean().optional(),
  is_primary_key: z.boolean().optional(),
  is_unique: z.boolean().optional(),
  default_value: z.string().optional(),
})

const tableSchema = z.object({
  table_name: z.string().min(1),
  table_description: z.string().min(1),
  fields: z.array(fieldSchema).min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = tableSchema.parse(body)
    
    // Check if table name already exists
    const existingTable = await prisma.table.findUnique({
      where: { table_name: validatedData.table_name }
    })
    
    if (existingTable) {
      return NextResponse.json(
        { error: 'Table name already exists' },
        { status: 400 }
      )
    }
    
    // Create table with fields
    const table = await prisma.table.create({
      data: {
        table_name: validatedData.table_name,
        table_description: validatedData.table_description,
        fields: {
          create: validatedData.fields.map(field => ({
            field_name: field.field_name,
            field_description: field.field_description,
            data_type: field.data_type || 'VARCHAR',
            max_length: field.max_length,
            is_nullable: field.is_nullable ?? true,
            is_primary_key: field.is_primary_key ?? false,
            is_unique: field.is_unique ?? false,
            default_value: field.default_value,
          }))
        }
      },
      include: {
        fields: true
      }
    })
    
    return NextResponse.json({ success: true, data: table })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error saving table:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        fields: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ success: true, data: tables })
  } catch (error) {
    console.error('Error fetching tables:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}