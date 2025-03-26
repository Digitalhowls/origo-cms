import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopNavbar from '@/components/layout/TopNavbar';
import StatisticsOverview from '@/components/dashboard/StatisticsOverview';
import RecentActivity from '@/components/dashboard/RecentActivity';
import { ResourceQuotaWidget } from '@/components/dashboard/ResourceQuotaWidget';
import { PlanInfoWidget } from '@/components/dashboard/PlanInfoWidget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { Plus, ExternalLink, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';

interface DashboardData {
  stats: {
    pageViews: number;
    averageTime: string;
    totalUsers: number;
    totalPages: number;
    viewsChart: {
      name: string;
      views: number;
    }[];
    usersChart: {
      name: string;
      users: number;
    }[];
  };
  recentActivities: any[];
  recentPages: any[];
  recentBlogPosts: any[];
}

const Dashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['/api/dashboard'],
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar collapsed={false} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNavbar 
          pageTitle="Dashboard" 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          actions={
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <ArrowUpRight className="h-4 w-4 mr-1" />
                Ver sitio
              </Button>
            </div>
          }
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Statistics Overview */}
            <StatisticsOverview data={data?.stats} isLoading={isLoading} />

            {/* Quick Actions and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Acciones rápidas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Link href="/pages/new">
                      <Button className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Nueva página
                      </Button>
                    </Link>
                    <Link href="/blog/new">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo artículo
                      </Button>
                    </Link>
                    <Link href="/media">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Subir medios
                      </Button>
                    </Link>
                    <Link href="/courses/new">
                      <Button variant="outline" className="w-full justify-start">
                        <Plus className="h-4 w-4 mr-2" />
                        Nuevo curso
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contenido reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-500">Páginas</h3>
                      <ul className="space-y-2">
                        {isLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <li key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </li>
                          ))
                        ) : data?.recentPages?.length ? (
                          data.recentPages.slice(0, 3).map((page) => (
                            <li key={page.id} className="flex items-center justify-between">
                              <Link href={`/pages/edit/${page.id}`} className="text-sm text-gray-700 hover:text-primary truncate max-w-[200px]">
                                {page.title}
                              </Link>
                              <a href={`/${page.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No hay páginas recientes</li>
                        )}
                      </ul>

                      <h3 className="text-sm font-medium text-gray-500 mt-4">Blog</h3>
                      <ul className="space-y-2">
                        {isLoading ? (
                          Array(3).fill(0).map((_, i) => (
                            <li key={i} className="animate-pulse">
                              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            </li>
                          ))
                        ) : data?.recentBlogPosts?.length ? (
                          data.recentBlogPosts.slice(0, 3).map((post) => (
                            <li key={post.id} className="flex items-center justify-between">
                              <Link href={`/blog/edit/${post.id}`} className="text-sm text-gray-700 hover:text-primary truncate max-w-[200px]">
                                {post.title}
                              </Link>
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500">No hay artículos recientes</li>
                        )}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="lg:col-span-2 space-y-6">
                <RecentActivity activities={data?.recentActivities} isLoading={isLoading} />
                
                {/* Plan Info and Resource Quotas - New widgets */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PlanInfoWidget />
                  <ResourceQuotaWidget />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
