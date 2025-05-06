
import React from "react";
import { Link } from "react-router-dom";
import AppLayout from "@/layouts/AppLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BookOpen,
  Code,
  MessageSquare,
  Plus,
  Shield,
  TrendingUp,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const RecentActivity = () => (
  <div className="space-y-4">
    {[
      {
        channel: "DSA",
        user: "Sourabh Singh",
        action: "mentioned you",
        time: "1h ago",
        content: "Can you help with this binary search implementation?",
        avatar: "SS",
      },
      {
        channel: "Competitive Programming",
        user: "Sumant Sahu",
        action: "posted a message",
        time: "45m ago",
        content:
          "Has anyone started on the binary tree implementation yet?",
        avatar: "SS",
      },
      {
        channel: "Resources",
        user: "Gevendra",
        action: "shared a link",
        time: "2h ago",
        content: "Ultimate Guide to Dynamic Programming",
        avatar: "GV",
      },
      {
        channel: "General",
        user: "Rupesh",
        action: "announced an event",
        time: "3h ago",
        content: "Weekend Hackathon - Register by Friday!",
        avatar: "RP",
      },
    ].map((activity, index) => (
      <div
        key={index}
        className="flex gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
      >
        <Avatar className="h-9 w-9">
          <AvatarFallback>{activity.avatar}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium">
              <span className="font-semibold">{activity.user}</span>{" "}
              {activity.action} in{" "}
              <Link
                to={`/channel/${activity.channel.toLowerCase().replace(/\s+/g, "")}`}
                className="text-primary font-medium hover:underline"
              >
                #{activity.channel}
              </Link>
            </p>
            <span className="text-xs text-muted-foreground">
              {activity.time}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {activity.content}
          </p>
        </div>
      </div>
    ))}
  </div>
);

const PopularChannels = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {[
      {
        name: "DSA",
        description: "Data Structures & Algorithms discussions",
        icon: <Code />,
        members: 156,
        messages: 642,
        id: "dsa",
      },
      {
        name: "Competitive Programming",
        description: "Contest strategies & problem solving",
        icon: <TrendingUp />,
        members: 98,
        messages: 412,
        id: "cp",
      },
      {
        name: "Cyber Security",
        description: "Security concepts & ethical hacking",
        icon: <Shield />,
        members: 72,
        messages: 284,
        id: "cybersecurity",
      },
      {
        name: "General",
        description: "General discussions & announcements",
        icon: <MessageSquare />,
        members: 215,
        messages: 1205,
        id: "general",
      },
    ].map((channel) => (
      <Link
        key={channel.name}
        to={`/channel/${channel.id}`}
        className="group"
      >
        <div className="border rounded-lg p-4 hover:border-primary hover:bg-accent/20 transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-md bg-primary/10 text-primary">
              {channel.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-medium group-hover:text-primary transition-colors">
                {channel.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {channel.description}
              </p>
            </div>
          </div>
          <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users size={14} />
              <span>{channel.members} members</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={14} />
              <span>{channel.messages} messages</span>
            </div>
          </div>
        </div>
      </Link>
    ))}
  </div>
);

const Resources = () => (
  <div className="space-y-4">
    {[
      {
        title: "Algorithms Crash Course",
        type: "PDF",
        author: "Prof. Miller",
        size: "2.4 MB",
        downloads: 87,
      },
      {
        title: "Competitive Programming Handbook",
        type: "E-Book",
        author: "Dr. Chen",
        size: "4.1 MB",
        downloads: 124,
      },
      {
        title: "Web Security Fundamentals",
        type: "Video Course",
        author: "Sarah Johnson",
        size: "1.2 GB",
        downloads: 56,
      },
      {
        title: "Machine Learning Basics",
        type: "Slide Deck",
        author: "David Wilson",
        size: "8.7 MB",
        downloads: 103,
      },
    ].map((resource, index) => (
      <div
        key={index}
        className="flex items-center gap-3 p-3 border rounded-lg hover:border-primary transition-colors"
      >
        <div className="p-2 rounded-md bg-primary/10 text-primary">
          <BookOpen size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{resource.title}</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>{resource.type}</span>
            <span>By {resource.author}</span>
            <span>{resource.size}</span>
            <span>{resource.downloads} downloads</span>
          </div>
        </div>
        <Button variant="outline" size="sm">Download</Button>
      </div>
    ))}
  </div>
);

const Index = () => {
  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Welcome to CollegeMate</h1>
          <p className="text-muted-foreground">
            Your college community platform for collaboration and learning
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="activity">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  <TabsTrigger value="channels">Popular Channels</TabsTrigger>
                  <TabsTrigger value="resources">Resources</TabsTrigger>
                </TabsList>
                <Button size="sm">
                  <Plus size={16} className="mr-1" />
                  New
                </Button>
              </div>

              <TabsContent value="activity" className="mt-0">
                <RecentActivity />
              </TabsContent>
              
              <TabsContent value="channels" className="mt-0">
                <PopularChannels />
              </TabsContent>
              
              <TabsContent value="resources" className="mt-0">
                <Resources />
              </TabsContent>
            </Tabs>
          </div>

          {/* Right sidebar */}
          <div>
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>
                    Events and activities scheduled this week
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      title: "DSA Workshop",
                      date: "Apr 15",
                      time: "3:00 - 5:00 PM",
                      location: "Lab 304",
                    },
                    {
                      title: "Hackathon Prep",
                      date: "Apr 17",
                      time: "6:30 - 8:00 PM",
                      location: "Online",
                    },
                    {
                      title: "Career Fair",
                      date: "Apr 19",
                      time: "10:00 AM - 4:00 PM",
                      location: "Main Auditorium",
                    },
                  ].map((event, index) => (
                    <div
                      key={index}
                      className="flex gap-3 py-2"
                    >
                      <div className="bg-primary/10 text-primary px-2 py-1 rounded text-center min-w-[3.5rem]">
                        <div className="text-xs font-medium">
                          {event.date}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <div className="text-sm text-muted-foreground">
                          {event.time}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {event.location}
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Events
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Active Members</CardTitle>
                  <CardDescription>
                    Members currently online
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: "Sumant Sahu", role: "Senior, CS", avatar: "SS" },
                    { name: "Sourabh Singh", role: "Senior, CS", avatar: "SS" },
                    { name: "Gevendra", role: "Junior, CS", avatar: "GV" },
                    { name: "Rupesh", role: "Senior, GATE", avatar: "RP" },
                  ].map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {member.name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {member.role}
                        </div>
                      </div>
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full">
                    View All Members
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
