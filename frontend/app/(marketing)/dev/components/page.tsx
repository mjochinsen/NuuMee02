'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Upload,
  Sparkles,
  Zap,
  CreditCard,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  XCircle,
  Star,
  ArrowRight,
  ChevronDown,
  Plus,
  Minus,
  Home,
  User,
  Play,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';

interface ComponentSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function ComponentSection({ title, description, children }: ComponentSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-[#F1F5F9]">{title}</h2>
        {description && <p className="text-[#94A3B8] mt-1">{description}</p>}
      </div>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

interface ComponentDemoProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function ComponentDemo({ title, description, children }: ComponentDemoProps) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-[#F1F5F9]">{title}</h3>
        {description && <p className="text-sm text-[#94A3B8]">{description}</p>}
      </div>
      <Card className="bg-[#1E293B] border-[#334155]">
        <CardContent className="pt-6">{children}</CardContent>
      </Card>
    </div>
  );
}

interface PlaceholderCardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
}

function PlaceholderCard({ title, description, icon }: PlaceholderCardProps) {
  return (
    <Card className="border-dashed bg-[#1E293B] border-[#334155]">
      <CardHeader>
        <div className="flex items-center gap-3">
          {icon && <div className="text-[#94A3B8]">{icon}</div>}
          <div>
            <CardTitle className="text-lg text-[#F1F5F9]">{title}</CardTitle>
            <CardDescription className="mt-1 text-[#94A3B8]">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-[#94A3B8]">
          <Info className="h-4 w-4" />
          <span>Custom component - to be implemented</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ComponentsDevPage() {
  const [progress, setProgress] = useState(33);
  const [sliderValue, setSliderValue] = useState([50]);
  const [isChecked, setIsChecked] = useState(false);
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  return (
    <div className="min-h-screen bg-[#0F172A]">
      {/* Header */}
      <header className="border-b border-[#334155]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold text-[#F1F5F9]">
              NuuMee Component Library
            </Link>
            <nav className="flex items-center gap-4">
              <Link href="/" className="text-sm text-[#94A3B8] hover:text-[#F1F5F9]">
                Home
              </Link>
              <Link href="/dev" className="text-sm text-[#94A3B8] hover:text-[#F1F5F9]">
                Dev Menu
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 space-y-16">
        {/* Introduction */}
        <div className="max-w-3xl">
          <h1 className="text-4xl font-bold tracking-tight text-[#F1F5F9] mb-4">Component Library</h1>
          <p className="text-lg text-[#94A3B8]">
            A comprehensive showcase of all UI components used in NuuMee. This page demonstrates both
            existing shadcn/ui components and placeholders for custom components to be implemented.
          </p>
        </div>

        {/* Button Variants */}
        <ComponentSection
          title="Button Variants"
          description="All available button styles and sizes"
        >
          <ComponentDemo title="Button Variants" description="Different visual styles">
            <div className="flex flex-wrap gap-4">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Button Sizes" description="Different size options">
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Button States" description="Loading and disabled states">
            <div className="flex flex-wrap gap-4">
              <Button disabled>Disabled</Button>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                With Icon
              </Button>
              <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90">
                <Sparkles className="mr-2 h-4 w-4" />
                Generate
              </Button>
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Form Controls */}
        <ComponentSection
          title="Form Controls"
          description="Input fields, selects, and other form elements"
        >
          <ComponentDemo title="Text Input" description="Standard text input with label">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="email" className="text-[#F1F5F9]">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]" />
            </div>
          </ComponentDemo>

          <ComponentDemo title="Textarea" description="Multi-line text input">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="description" className="text-[#F1F5F9]">Description</Label>
              <Textarea id="description" placeholder="Enter your description..." rows={4} className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]" />
            </div>
          </ComponentDemo>

          <ComponentDemo title="Select" description="Dropdown selection">
            <div className="space-y-2 max-w-sm">
              <Label htmlFor="plan" className="text-[#F1F5F9]">Select Plan</Label>
              <Select>
                <SelectTrigger id="plan" className="bg-[#0F172A] border-[#334155] text-[#F1F5F9]">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent className="bg-[#1E293B] border-[#334155]">
                  <SelectItem value="free" className="text-[#F1F5F9]">Free Plan</SelectItem>
                  <SelectItem value="pro" className="text-[#F1F5F9]">Pro Plan</SelectItem>
                  <SelectItem value="enterprise" className="text-[#F1F5F9]">Enterprise Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Checkbox" description="Binary selection">
            <div className="flex items-center space-x-2">
              <Checkbox id="terms" checked={isChecked} onCheckedChange={(checked) => setIsChecked(!!checked)} />
              <Label htmlFor="terms" className="cursor-pointer text-[#94A3B8]">
                I agree to the terms and conditions
              </Label>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Switch" description="Toggle control">
            <div className="flex items-center space-x-2">
              <Switch id="notifications" checked={isSwitchOn} onCheckedChange={setIsSwitchOn} />
              <Label htmlFor="notifications" className="cursor-pointer text-[#94A3B8]">
                Enable notifications
              </Label>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Slider" description="Numeric range input">
            <div className="space-y-4 max-w-sm">
              <Label className="text-[#F1F5F9]">Volume: {sliderValue[0]}%</Label>
              <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Badges & Labels */}
        <ComponentSection title="Badges & Labels" description="Status indicators and labels">
          <ComponentDemo title="Badge Variants" description="Different badge styles">
            <div className="flex flex-wrap gap-3">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Badge with Icons" description="Badges combined with icons">
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-green-500/10 text-green-400 border-green-500/20">
                <CheckCircle className="mr-1 h-3 w-3" />
                Active
              </Badge>
              <Badge className="bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/20">
                <Star className="mr-1 h-3 w-3" />
                Featured
              </Badge>
              <Badge className="bg-red-500/10 text-red-400 border-red-500/20">
                <XCircle className="mr-1 h-3 w-3" />
                Error
              </Badge>
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Tabs */}
        <ComponentSection title="Tabs" description="Tabbed content navigation">
          <ComponentDemo title="Tab Component" description="Organize content in tabs">
            <Tabs defaultValue="overview" className="max-w-2xl">
              <TabsList className="bg-[#0F172A] border border-[#334155]">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="pricing">Pricing</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="space-y-4">
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardHeader>
                    <CardTitle className="text-[#F1F5F9]">Overview</CardTitle>
                    <CardDescription className="text-[#94A3B8]">General information about the product</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#94A3B8]">
                      NuuMee is an AI-powered video generation platform that transforms your ideas into
                      professional videos in seconds.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="features" className="space-y-4">
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardHeader>
                    <CardTitle className="text-[#F1F5F9]">Features</CardTitle>
                    <CardDescription className="text-[#94A3B8]">Key capabilities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm text-[#94A3B8]">
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        AI-powered video generation
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Multiple style options
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        HD quality output
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="pricing" className="space-y-4">
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardHeader>
                    <CardTitle className="text-[#F1F5F9]">Pricing</CardTitle>
                    <CardDescription className="text-[#94A3B8]">Flexible pricing options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-[#94A3B8]">
                      Choose from our free tier or upgrade to Pro for unlimited access.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </ComponentDemo>
        </ComponentSection>

        {/* Card Components */}
        <ComponentSection title="Card Components" description="Various card layouts and styles">
          <ComponentDemo title="Pricing Cards" description="Subscription pricing display">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-[#F1F5F9]">Free</CardTitle>
                  <CardDescription className="text-[#94A3B8]">Perfect for trying out</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#F1F5F9] mb-4">$0</div>
                  <ul className="space-y-2 text-sm text-[#94A3B8]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      10 credits/month
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Basic features
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-[#334155] text-[#F1F5F9]">
                    Current Plan
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#1E293B] border-[#00F0D9]">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#F1F5F9]">Pro</CardTitle>
                    <Badge className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-0">Popular</Badge>
                  </div>
                  <CardDescription className="text-[#94A3B8]">For power users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#F1F5F9] mb-4">$29/mo</div>
                  <ul className="space-y-2 text-sm text-[#94A3B8]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Unlimited credits
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      All features
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Priority support
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90">Upgrade Now</Button>
                </CardFooter>
              </Card>

              <Card className="bg-[#1E293B] border-[#334155]">
                <CardHeader>
                  <CardTitle className="text-[#F1F5F9]">Enterprise</CardTitle>
                  <CardDescription className="text-[#94A3B8]">Custom solutions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-[#F1F5F9] mb-4">Custom</div>
                  <ul className="space-y-2 text-sm text-[#94A3B8]">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Custom credits
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Dedicated support
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full border-[#334155] text-[#F1F5F9]">
                    Contact Sales
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Dropdown Menu */}
        <ComponentSection title="Dropdown Menu" description="Contextual menus and actions">
          <ComponentDemo title="Dropdown Menu" description="Menu with various options">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-[#334155] text-[#F1F5F9]">
                  Open Menu
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#1E293B] border-[#334155]">
                <DropdownMenuLabel className="text-[#F1F5F9]">My Account</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#334155]" />
                <DropdownMenuItem className="text-[#F1F5F9] focus:bg-[#334155]">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#F1F5F9] focus:bg-[#334155]">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[#F1F5F9] focus:bg-[#334155]">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#334155]" />
                <DropdownMenuItem className="text-red-400 focus:bg-[#334155]">
                  <XCircle className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ComponentDemo>
        </ComponentSection>

        {/* Progress Indicators */}
        <ComponentSection title="Progress Indicators" description="Loading and progress states">
          <ComponentDemo title="Progress Bar" description="Linear progress indicator">
            <div className="space-y-4 max-w-md">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#F1F5F9]">Progress</span>
                  <span className="text-[#94A3B8]">{progress}%</span>
                </div>
                <Progress value={progress} className="bg-[#334155]" />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setProgress(Math.max(0, progress - 10))}>
                  <Minus className="h-4 w-4" />
                </Button>
                <Button size="sm" onClick={() => setProgress(Math.min(100, progress + 10))}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Alerts */}
        <ComponentSection title="Alerts & Notifications" description="Status messages and notifications">
          <ComponentDemo title="Alert Variants" description="Different alert types">
            <div className="space-y-4 max-w-2xl">
              <Alert className="bg-[#1E293B] border-[#334155]">
                <Info className="h-4 w-4 text-[#00F0D9]" />
                <AlertTitle className="text-[#F1F5F9]">Information</AlertTitle>
                <AlertDescription className="text-[#94A3B8]">This is an informational message.</AlertDescription>
              </Alert>

              <Alert className="bg-green-500/10 border-green-500/20">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-[#F1F5F9]">Success</AlertTitle>
                <AlertDescription className="text-[#94A3B8]">Your action was completed successfully.</AlertDescription>
              </Alert>

              <Alert className="bg-red-500/10 border-red-500/20">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertTitle className="text-[#F1F5F9]">Error</AlertTitle>
                <AlertDescription className="text-[#94A3B8]">Something went wrong. Please try again.</AlertDescription>
              </Alert>
            </div>
          </ComponentDemo>

          <ComponentDemo title="Toast Notifications" description="Temporary notification messages">
            <div className="flex flex-wrap gap-3">
              <Button onClick={() => toast.success('Action completed successfully!')}>Success Toast</Button>
              <Button onClick={() => toast.error('Something went wrong!')}>Error Toast</Button>
              <Button onClick={() => toast.info('Here is some information')}>Info Toast</Button>
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Utility Components */}
        <ComponentSection title="Utility Components" description="Helper components and utilities">
          <ComponentDemo title="Tooltip" description="Contextual information on hover">
            <TooltipProvider>
              <div className="flex gap-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" className="border-[#334155] text-[#F1F5F9]">Hover me</Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                    <p>This is a tooltip</p>
                  </TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="icon" className="border-[#334155] text-[#F1F5F9]">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                    <p>Additional information</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </ComponentDemo>

          <ComponentDemo title="Separator" description="Visual divider">
            <div className="space-y-4 max-w-md">
              <div>
                <h4 className="text-sm font-semibold text-[#F1F5F9] mb-2">Section 1</h4>
                <p className="text-sm text-[#94A3B8]">Content for the first section</p>
              </div>
              <Separator className="bg-[#334155]" />
              <div>
                <h4 className="text-sm font-semibold text-[#F1F5F9] mb-2">Section 2</h4>
                <p className="text-sm text-[#94A3B8]">Content for the second section</p>
              </div>
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Color Palette */}
        <ComponentSection title="Color Palette" description="Design system colors">
          <ComponentDemo title="NuuMee Brand Colors" description="Primary color tokens">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#00F0D9]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Primary Cyan</p>
                <p className="text-xs text-[#94A3B8]">#00F0D9</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#3B1FE2]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Primary Purple</p>
                <p className="text-xs text-[#94A3B8]">#3B1FE2</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#0F172A] border border-[#334155]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Background Dark</p>
                <p className="text-xs text-[#94A3B8]">#0F172A</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#1E293B] border border-[#334155]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Card Background</p>
                <p className="text-xs text-[#94A3B8]">#1E293B</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#334155]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Border</p>
                <p className="text-xs text-[#94A3B8]">#334155</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#F1F5F9]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Text Primary</p>
                <p className="text-xs text-[#94A3B8]">#F1F5F9</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#94A3B8]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Text Secondary</p>
                <p className="text-xs text-[#94A3B8]">#94A3B8</p>
              </div>
              <div className="space-y-2">
                <div className="h-20 rounded-lg bg-[#64748B]" />
                <p className="text-sm font-medium text-[#F1F5F9]">Text Muted</p>
                <p className="text-xs text-[#94A3B8]">#64748B</p>
              </div>
            </div>
          </ComponentDemo>
        </ComponentSection>

        {/* Custom Components Placeholders */}
        <ComponentSection
          title="Custom Components"
          description="Application-specific components to be implemented"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <PlaceholderCard
              title="Upload Zone Block"
              description="Drag-and-drop file upload area with progress tracking"
              icon={<Upload className="h-6 w-6" />}
            />
            <PlaceholderCard
              title="Result Section Block"
              description="Video generation results display with preview and download"
              icon={<Sparkles className="h-6 w-6" />}
            />
            <PlaceholderCard
              title="Post-Processing Options Block"
              description="Video editing controls including trim, filters, and effects"
              icon={<Settings className="h-6 w-6" />}
            />
            <PlaceholderCard
              title="Buy Credits Modal"
              description="Credit purchase dialog with package selection"
              icon={<CreditCard className="h-6 w-6" />}
            />
            <PlaceholderCard
              title="Subscription Modal"
              description="Subscription plan selection and upgrade flow"
              icon={<Star className="h-6 w-6" />}
            />
            <PlaceholderCard
              title="Video Player Component"
              description="Custom video player with playback controls"
              icon={<Play className="h-6 w-6" />}
            />
          </div>
        </ComponentSection>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#334155] mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm text-[#94A3B8]">
              NuuMee Component Library - Built with shadcn/ui
            </p>
            <Link href="/dev" className="text-sm text-[#00F0D9] hover:underline">
              Back to Dev Menu
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
