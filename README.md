# Project Management & Issue Tracking System

A comprehensive project management and issue tracking application built with Next.js, featuring hierarchical organization structure, team management, sprint planning, and user performance analytics.

## 🚀 Features

### Core Functionality
- **Authentication System**: Secure login and signup with JWT token-based authentication
- **Hierarchical Organization**: Organizations → Workspaces → Projects structure
- **Team Management**: Create and manage teams, assign members, and track team performance
- **Issue Tracking**: Create, assign, and manage issues with custom issue types
- **Sprint Management**: Plan sprints, assign issues, and track velocity
- **Role-Based Access Control**: Manage roles and permissions across organizations and workspaces
- **User Performance Analytics**: Track and analyze user performance metrics
- **Request System**: Send and manage incoming/outgoing requests
- **Analysis Dashboards**: Comprehensive analytics for projects, workspaces, and organizations

### Key Capabilities
- **Custom Issue Types**: Create and manage custom issue types for your workflow
- **Velocity Tracking**: Monitor team and sprint velocity over time
- **Assign Issues**: Assign issues to team members across projects
- **Team Assignments**: Assign teams to projects and workspaces
- **Performance Monitoring**: Track user performance metrics and analytics

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Forms**: React Hook Form with Zod validation
- **Data Fetching**: SWR (stale-while-revalidate)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Theming**: next-themes (dark/light mode support)

### Development Tools
- **Package Manager**: pnpm
- **Linting**: ESLint (via Next.js)
- **Type Checking**: TypeScript 5

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher)
- **Backend API** (see API Configuration section)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8001
   ```
   Replace with your backend API URL if different.

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
auth-app/
├── app/                      # Next.js app router pages
│   ├── login/               # Authentication pages
│   ├── signup/
│   ├── dashboard/           # Main dashboard
│   ├── organizations/       # Organization management
│   │   └── [orgId]/
│   │       ├── workspaces/  # Workspace management
│   │       ├── teams/       # Team management
│   │       ├── analysis/    # Analytics
│   │       └── ...
│   ├── workspaces/          # Workspace pages
│   │   └── [workspaceId]/
│   │       └── projects/    # Project pages
│   │           └── [projectId]/
│   │               ├── issues/
│   │               ├── sprints/
│   │               └── teams/
│   ├── projects/            # Project analysis
│   ├── teams/               # Team management
│   ├── users/               # User performance
│   └── profile/             # User profile
├── components/              # React components
│   ├── auth/               # Authentication forms
│   ├── dashboard/          # Dashboard components
│   ├── issues/             # Issue management
│   ├── organizations/      # Organization components
│   ├── projects/           # Project components
│   ├── sprints/            # Sprint management
│   ├── teams/              # Team components
│   ├── users/              # User components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Utility functions
│   ├── api.ts              # API client with authentication
│   └── utils.ts            # Helper functions
├── hooks/                  # Custom React hooks
└── public/                 # Static assets
```

## 🔌 API Configuration

The application expects a backend API running by default on `http://127.0.0.1:8001`. The API client:

- Automatically includes authentication tokens from `localStorage`
- Handles API errors gracefully
- Supports standard REST endpoints

**Environment Variables:**
- `NEXT_PUBLIC_API_URL`: Backend API base URL (default: `http://127.0.0.1:8001`)

The API client in `lib/api.ts` uses JWT tokens stored in `localStorage` with the key `access_token`.

## 📜 Available Scripts

- `pnpm dev` - Start development server on port 3000
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint to check code quality

## 🎨 UI Components

This project uses [shadcn/ui](https://ui.shadcn.com/) components built on Radix UI primitives. Components are located in `components/ui/` and include:

- Buttons, Forms, Inputs
- Dialogs, Dropdowns, Selects
- Tables, Cards, Tabs
- Toast notifications
- And many more...

## 🔐 Authentication Flow

1. Users can sign up or log in through the authentication pages
2. Upon successful authentication, the JWT token is stored in `localStorage`
3. All subsequent API requests automatically include the token via `fetchWithAuth`
4. The application handles authentication errors and redirects when needed

## 📊 Key Features in Detail

### Organizations
- Create and manage organizations
- View organization-level analytics
- Manage organization-wide teams and roles

### Workspaces
- Create workspaces within organizations
- Assign teams to workspaces
- Manage workspace-specific settings

### Projects
- Create projects within workspaces
- Track project progress and analytics
- Manage project-specific teams and issues

### Issues
- Create and assign issues to team members
- Define custom issue types
- Track issue status and assignments

### Sprints
- Create sprints for projects
- Assign issues to sprints
- Track sprint velocity and progress

### Teams
- Create teams and add members
- Assign teams to projects and workspaces
- Track team velocity over time

### Analytics
- Project analysis dashboards
- Team velocity tracking
- User performance metrics
- Organization-wide analytics

## 🚀 Deployment

### Build for Production

```bash
pnpm build
```

### Deploy to Vercel

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to a Git repository
2. Import the project to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set `NEXT_PUBLIC_API_URL` to your production API URL in your deployment platform's environment variables.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is private and proprietary.

## 🐛 Troubleshooting

### Common Issues

**API Connection Errors:**
- Ensure your backend API is running
- Check that `NEXT_PUBLIC_API_URL` is correctly set
- Verify CORS settings on your backend API

**Authentication Issues:**
- Clear `localStorage` and try logging in again
- Check that tokens are being stored correctly
- Verify API endpoint responses

**Build Errors:**
- Delete `node_modules` and `.next` folder, then run `pnpm install` again
- Ensure all environment variables are set
- Check TypeScript errors with `pnpm build`

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

---

Built with ❤️ using Next.js and modern web technologies.

