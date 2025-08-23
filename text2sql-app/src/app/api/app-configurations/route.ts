import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const appConfigurationSchema = z.object({
  app_name: z.string().min(1, 'App name is required'),
  business_instructions: z.string().min(1, 'Business instructions are required'),
  tableIds: z.array(z.number()).min(1, 'At least one table must be selected'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = appConfigurationSchema.parse(body)
    
    // Check if app name already exists
    const existingApp = await prisma.appConfiguration.findUnique({
      where: { app_name: validatedData.app_name }
    })
    
    if (existingApp) {
      return NextResponse.json(
        { error: 'App name already exists' },
        { status: 400 }
      )
    }
    
    // Verify all table IDs exist
    const tableCount = await prisma.table.count({
      where: {
        id: { in: validatedData.tableIds }
      }
    })
    
    if (tableCount !== validatedData.tableIds.length) {
      return NextResponse.json(
        { error: 'One or more table IDs are invalid' },
        { status: 400 }
      )
    }
    
    // Create app configuration with table associations
    const appConfiguration = await prisma.appConfiguration.create({
      data: {
        app_name: validatedData.app_name,
        business_instructions: validatedData.business_instructions,
        tables: {
          create: validatedData.tableIds.map(tableId => ({
            tableId: tableId
          }))
        }
      },
      include: {
        tables: {
          include: {
            table: {
              include: {
                fields: true
              }
            }
          }
        }
      }
    })
    
    return NextResponse.json({ success: true, data: appConfiguration })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 400 }
      )
    }
    
    console.error('Error saving app configuration:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const appConfigurations = await prisma.appConfiguration.findMany({
      include: {
        tables: {
          include: {
            table: {
              include: {
                fields: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    
    return NextResponse.json({ success: true, data: appConfigurations })
  } catch (error) {
    console.error('Error fetching app configurations:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}