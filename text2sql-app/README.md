# Text2SQL Application

A Next.js application for creating and managing database schemas for natural language to SQL query conversion. This application provides a user-friendly wizard interface to define table structures and field descriptions that can be used by AI models to generate accurate SQL queries.

## Features

- **Schema Wizard**: Interactive form to create database table definitions
- **Field Management**: Add up to 50+ fields per table with detailed descriptions
- **Data Persistence**: SQLite database integration with Prisma ORM
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS
- **Vercel Ready**: Optimized for deployment on Vercel platform

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up the database:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Usage

### Creating a Table Schema

1. Fill out the table information:
   - **Table Name**: The name of your database table
   - **Table Description**: A brief description of what the table stores

2. Add fields:
   - **Field Name**: The column name in the database
   - **Field Description**: Detailed description of what this field contains
   - Use the "Add Field" button to add more fields (supports up to 50+ fields)

3. Click "Save Table Schema" to store the schema in the database

### Viewing Saved Schemas

- All saved table schemas are displayed in the "Saved Tables" section
- Click on any table card to view detailed field information
- Tables show field count and creation date

## Database Schema

The application uses SQLite with Prisma ORM and includes two main models:

- **Table**: Stores table metadata (name, description, timestamps)
- **Field**: Stores field information linked to tables (name, description, relationships)

## API Endpoints

- `POST /api/tables` - Create a new table schema
- `GET /api/tables` - Retrieve all table schemas

## Deployment on Vercel

1. Connect your repository to Vercel
2. Vercel will automatically detect the Next.js framework
3. Environment variables are handled automatically
4. The SQLite database will be created on first deployment

### Environment Variables

Create a `.env.local` file with:

```env
DATABASE_URL="file:./dev.db"
```

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite with Prisma ORM
- **Forms**: React Hook Form with Zod validation
- **Icons**: Lucide React
- **Deployment**: Vercel

## Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:studio    # Open Prisma Studio
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

MIT License
