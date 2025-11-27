import { useState } from 'react';
import { 
  Upload, 
  X, 
  Info, 
  Link as LinkIcon, 
  Zap, 
  Plus, 
  User, 
  ChevronDown,
  CreditCard,
  Key,
  Briefcase,
  HelpCircle,
  Settings,
  LogOut,
  Gift,
  Star,
  Check,
  Play,
  Download,
  Share2,
  Heart,
  ExternalLink,
  BookOpen,
  Clock,
  TrendingUp,
  Users,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui/tooltip';
import { Progress } from '../components/ui/progress';
import { Slider } from '../components/ui/slider';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { UploadZone } from '../components/UploadZone';
import { ResultSection } from '../components/ResultSection';
import { PostProcessingOptions } from '../components/PostProcessingOptions';
import { BuyCreditsModal } from '../components/BuyCreditsModal';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { toast } from 'sonner@2.0.3';

export default function ComponentsDEVPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [showBuyCreditsModal, setShowBuyCreditsModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-[#0F172A]">
        {/* Header Section */}
        <section className="border-b border-[#334155] bg-[#1E293B] py-8">
          <div className="container mx-auto px-6">
            <h1 className="text-[#F1F5F9] mb-2">Component Library</h1>
            <p className="text-[#94A3B8]">
              Showcase of all reusable UI components in the NuuMee.AI project
            </p>
          </div>
        </section>

        <div className="container mx-auto px-6 py-12">
          {/* Navigation Components */}
          <ComponentSection title="Navigation Components">
            <div className="space-y-6">
              {/* Header */}
              <ComponentDemo title="Header" description="Main navigation header with logo, nav links, credits, and user dropdown">
                <div className="border border-[#334155] rounded-lg overflow-hidden">
                  <Header />
                </div>
              </ComponentDemo>

              {/* Footer */}
              <ComponentDemo title="Footer" description="Site footer with links and copyright">
                <div className="border border-[#334155] rounded-lg overflow-hidden">
                  <Footer />
                </div>
              </ComponentDemo>

              {/* Navigation Item */}
              <ComponentDemo title="Navigation Item" description="Individual nav link with active state">
                <div className="flex gap-4 bg-[#1E293B] p-4 rounded-lg">
                  <Link to="/" className="text-[#F1F5F9] hover:text-[#00F0D9] transition-colors">
                    Active Link
                  </Link>
                  <Link to="/" className="text-[#94A3B8] hover:text-[#00F0D9] transition-colors">
                    Inactive Link
                  </Link>
                </div>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Button Variants */}
          <ComponentSection title="Button Variants">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComponentDemo title="Primary Button" description="Gradient CTA button">
                <Button className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90 text-white">
                  Primary Action
                </Button>
              </ComponentDemo>

              <ComponentDemo title="Secondary Button" description="Outlined button">
                <Button variant="outline" className="border-[#334155] text-[#F1F5F9] hover:border-[#00F0D9] hover:text-[#00F0D9]">
                  Secondary Action
                </Button>
              </ComponentDemo>

              <ComponentDemo title="Ghost Button" description="Minimal text button">
                <Button variant="ghost" className="text-[#94A3B8] hover:text-[#00F0D9]">
                  Ghost Button
                </Button>
              </ComponentDemo>

              <ComponentDemo title="Link Button" description="Button styled as link">
                <Button variant="link" className="text-[#00F0D9] hover:text-[#00F0D9]/80">
                  Link Button <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </ComponentDemo>

              <ComponentDemo title="Destructive Button" description="Delete/cancel action">
                <Button variant="destructive">
                  Delete Action
                </Button>
              </ComponentDemo>

              <ComponentDemo title="Credits Button" description="Credits display with add action">
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] hover:opacity-90 transition-opacity">
                  <Zap className="w-4 h-4 text-white" />
                  <span className="text-white">25 Credits</span>
                  <Plus className="w-4 h-4 text-white" />
                </button>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Form Controls */}
          <ComponentSection title="Form Controls">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComponentDemo title="Text Input" description="Standard text input field">
                <div className="space-y-2">
                  <Label htmlFor="text-input" className="text-[#F1F5F9]">Label</Label>
                  <Input 
                    id="text-input"
                    placeholder="Enter text..." 
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B]"
                  />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Select Dropdown" description="Dropdown selection">
                <div className="space-y-2">
                  <Label className="text-[#F1F5F9]">Select Option</Label>
                  <Select>
                    <SelectTrigger className="bg-[#1E293B] border-[#334155] text-[#F1F5F9]">
                      <SelectValue placeholder="Choose option..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="option1" className="text-[#F1F5F9]">Option 1</SelectItem>
                      <SelectItem value="option2" className="text-[#F1F5F9]">Option 2</SelectItem>
                      <SelectItem value="option3" className="text-[#F1F5F9]">Option 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </ComponentDemo>

              <ComponentDemo title="Textarea" description="Multi-line text input">
                <div className="space-y-2">
                  <Label htmlFor="textarea" className="text-[#F1F5F9]">Description</Label>
                  <Textarea 
                    id="textarea"
                    placeholder="Enter description..." 
                    className="bg-[#1E293B] border-[#334155] text-[#F1F5F9] placeholder:text-[#64748B] min-h-[100px]"
                  />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Checkbox" description="Toggle checkbox">
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="checkbox"
                    className="border-[#334155] data-[state=checked]:bg-[#00F0D9] data-[state=checked]:border-[#00F0D9]"
                  />
                  <Label htmlFor="checkbox" className="text-[#94A3B8] cursor-pointer">
                    Accept terms and conditions
                  </Label>
                </div>
              </ComponentDemo>

              <ComponentDemo title="Switch" description="Toggle switch">
                <div className="flex items-center gap-2">
                  <Switch 
                    id="switch"
                    className="data-[state=checked]:bg-[#00F0D9]"
                  />
                  <Label htmlFor="switch" className="text-[#94A3B8] cursor-pointer">
                    Enable notifications
                  </Label>
                </div>
              </ComponentDemo>

              <ComponentDemo title="Slider" description="Range slider control">
                <div className="space-y-2">
                  <Label className="text-[#F1F5F9]">Quality: 75%</Label>
                  <Slider 
                    defaultValue={[75]} 
                    max={100} 
                    step={1}
                    className="[&_[role=slider]]:bg-[#00F0D9] [&_[role=slider]]:border-[#00F0D9]"
                  />
                </div>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Badges and Labels */}
          <ComponentSection title="Badges & Labels">
            <div className="flex flex-wrap gap-4">
              <Badge className="bg-[#00F0D9]/10 text-[#00F0D9] border-[#00F0D9]/20">
                ✨ New Feature
              </Badge>
              <Badge variant="secondary" className="bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] text-white border-0">
                Creator
              </Badge>
              <Badge variant="outline" className="border-[#334155] text-[#94A3B8]">
                Beta
              </Badge>
              <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                ✓ Active
              </Badge>
              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                ⚠ Pending
              </Badge>
              <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                ✗ Failed
              </Badge>
            </div>
          </ComponentSection>

          {/* Tabs */}
          <ComponentSection title="Tabs">
            <ComponentDemo title="Tab Navigation" description="Horizontal tab switcher">
              <Tabs defaultValue="tab1" className="w-full">
                <TabsList className="bg-[#1E293B] border border-[#334155]">
                  <TabsTrigger value="tab1" className="data-[state=active]:bg-[#00F0D9] data-[state=active]:text-white">
                    Tab 1
                  </TabsTrigger>
                  <TabsTrigger value="tab2" className="data-[state=active]:bg-[#00F0D9] data-[state=active]:text-white">
                    Tab 2
                  </TabsTrigger>
                  <TabsTrigger value="tab3" className="data-[state=active]:bg-[#00F0D9] data-[state=active]:text-white">
                    Tab 3
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="tab1" className="text-[#94A3B8] mt-4">Content for Tab 1</TabsContent>
                <TabsContent value="tab2" className="text-[#94A3B8] mt-4">Content for Tab 2</TabsContent>
                <TabsContent value="tab3" className="text-[#94A3B8] mt-4">Content for Tab 3</TabsContent>
              </Tabs>
            </ComponentDemo>
          </ComponentSection>

          {/* Card Variants */}
          <ComponentSection title="Card Components">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Card */}
              <ComponentDemo title="Basic Card" description="Standard card container">
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardHeader>
                    <CardTitle className="text-[#F1F5F9]">Card Title</CardTitle>
                    <CardDescription className="text-[#94A3B8]">Card description goes here</CardDescription>
                  </CardHeader>
                  <CardContent className="text-[#94A3B8]">
                    <p>This is the card content area. Add any content here.</p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="border-[#334155] text-[#F1F5F9]">
                      Action
                    </Button>
                  </CardFooter>
                </Card>
              </ComponentDemo>

              {/* Pricing Card */}
              <ComponentDemo title="Pricing Card" description="Subscription tier card">
                <Card className="bg-[#1E293B] border-[#334155] hover:border-[#00F0D9] transition-colors">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-[#F1F5F9]">Pro Plan</CardTitle>
                      <Badge className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] text-white border-0">
                        Popular
                      </Badge>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-[#F1F5F9]">$29</span>
                      <span className="text-[#94A3B8]">/month</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-[#94A3B8]">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00F0D9]" />
                        500 credits/month
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00F0D9]" />
                        HD resolution
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-[#00F0D9]" />
                        Priority processing
                      </li>
                    </ul>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2] hover:opacity-90">
                      Subscribe Now
                    </Button>
                  </CardFooter>
                </Card>
              </ComponentDemo>

              {/* Feature Card */}
              <ComponentDemo title="Feature Card" description="Product feature highlight">
                <Card className="bg-[#1E293B] border-[#334155] hover:border-[#00F0D9] transition-colors">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center mb-4">
                      <Zap className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-[#F1F5F9] mb-2">Lightning Fast</h3>
                    <p className="text-[#94A3B8]">
                      Process videos in minutes with our optimized AI engine
                    </p>
                  </CardContent>
                </Card>
              </ComponentDemo>

              {/* Testimonial Card */}
              <ComponentDemo title="Testimonial Card" description="Customer testimonial">
                <Card className="bg-[#1E293B] border-[#334155]">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-[#F1F5F9] mb-4">
                      "This tool completely changed how we create content. Amazing results!"
                    </p>
                    <div className="text-[#94A3B8]">
                      — Sarah Chen<br />
                      <span className="text-sm">Content Creator</span>
                    </div>
                  </CardContent>
                </Card>
              </ComponentDemo>

              {/* Doc Card */}
              <ComponentDemo title="Documentation Card" description="Help article or guide">
                <Card className="bg-[#1E293B] border-[#334155] hover:border-[#00F0D9] transition-colors cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#00F0D9]/10 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="w-5 h-5 text-[#00F0D9]" />
                      </div>
                      <div>
                        <h3 className="text-[#F1F5F9] mb-1">Getting Started Guide</h3>
                        <p className="text-[#94A3B8] mb-2">
                          Learn the basics of character replacement
                        </p>
                        <div className="flex items-center gap-2 text-[#94A3B8] text-sm">
                          <Clock className="w-3 h-3" />
                          5 min read
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </ComponentDemo>

              {/* Quick Link Card */}
              <ComponentDemo title="Quick Link Card" description="Navigation shortcut">
                <Card className="bg-[#1E293B] border-[#334155] hover:border-[#00F0D9] transition-colors cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-[#F1F5F9]">Account Settings</h3>
                          <p className="text-[#94A3B8] text-sm">Manage your profile</p>
                        </div>
                      </div>
                      <ExternalLink className="w-5 h-5 text-[#94A3B8] group-hover:text-[#00F0D9] transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Upload Zone */}
          <ComponentSection title="Upload Zone Block">
            <ComponentDemo title="File Upload Zone" description="Drag-and-drop file uploader with preview">
              <div className="max-w-2xl">
                <UploadZone
                  title="Reference Image"
                  accept="image/*"
                  maxSize="50MB"
                  allowedFormats="JPG, PNG, WebP"
                  onFileSelect={() => {}}
                  safetyCheckerEnabled={true}
                  onSafetyCheckerChange={() => {}}
                />
              </div>
            </ComponentDemo>
          </ComponentSection>

          {/* Result Section */}
          <ComponentSection title="Result Section Block">
            <ComponentDemo title="Video Result Display" description="Generated video result with actions">
              <div className="max-w-2xl">
                <ResultSection
                  resultUrl="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=450&fit=crop"
                  status="completed"
                  progress={100}
                  creditsUsed={10}
                  processingTime="2m 34s"
                  onDownload={() => toast.success('Download started')}
                  onShare={() => toast.success('Link copied to clipboard')}
                />
              </div>
            </ComponentDemo>
          </ComponentSection>

          {/* Post Processing Options */}
          <ComponentSection title="Post-Processing Options Block">
            <ComponentDemo title="Enhancement Controls" description="Video enhancement toggles">
              <div className="max-w-2xl">
                <PostProcessingOptions
                  options={{
                    faceEnhancer: false,
                    colorCorrection: false,
                    upscale: false,
                    denoiser: false,
                    lipSync: false,
                    frameInterpolation: false,
                  }}
                  onToggle={(option, value) => console.log(option, value)}
                />
              </div>
            </ComponentDemo>
          </ComponentSection>

          {/* Settings Row */}
          <ComponentSection title="Settings Row Pattern">
            <ComponentDemo title="Settings Control Row" description="Label + control layout pattern">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[#1E293B] border border-[#334155] rounded-lg">
                  <div>
                    <div className="text-[#F1F5F9] mb-1">Email Notifications</div>
                    <div className="text-[#94A3B8] text-sm">Receive updates about your account</div>
                  </div>
                  <Switch className="data-[state=checked]:bg-[#00F0D9]" />
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1E293B] border border-[#334155] rounded-lg">
                  <div>
                    <div className="text-[#F1F5F9] mb-1">Default Quality</div>
                    <div className="text-[#94A3B8] text-sm">Choose output quality preset</div>
                  </div>
                  <Select>
                    <SelectTrigger className="w-[180px] bg-[#0F172A] border-[#334155] text-[#F1F5F9]">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E293B] border-[#334155]">
                      <SelectItem value="sd" className="text-[#F1F5F9]">SD (480p)</SelectItem>
                      <SelectItem value="hd" className="text-[#F1F5F9]">HD (1080p)</SelectItem>
                      <SelectItem value="4k" className="text-[#F1F5F9]">4K (2160p)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-[#1E293B] border border-[#334155] rounded-lg">
                  <div>
                    <div className="text-[#F1F5F9] mb-1">Processing Speed</div>
                    <div className="text-[#94A3B8] text-sm">Balance between speed and quality</div>
                  </div>
                  <div className="w-[180px]">
                    <Slider defaultValue={[50]} max={100} step={1} />
                  </div>
                </div>
              </div>
            </ComponentDemo>
          </ComponentSection>

          {/* Dropdown Menu */}
          <ComponentSection title="Dropdown Menu">
            <ComponentDemo title="User Account Dropdown" description="Account menu with actions">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1E293B] border border-[#334155] hover:border-[#00F0D9] transition-colors">
                    <User className="w-4 h-4 text-[#94A3B8]" />
                    <span className="text-[#F1F5F9]">Alex Chen</span>
                    <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#1E293B] border-[#334155]">
                  <div className="px-2 py-3 border-b border-[#334155]">
                    <div className="flex items-center justify-between">
                      <span className="text-[#F1F5F9]">Alex Chen</span>
                      <Badge className="bg-gradient-to-r from-[#3B1FE2] to-[#00F0D9] text-white border-0">
                        Pro
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                    <Gift className="w-4 h-4 mr-2" />
                    Refer Friends
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#334155]" />
                  <DropdownMenuItem className="text-[#F1F5F9] hover:bg-[#334155] hover:text-[#00F0D9] cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ComponentDemo>
          </ComponentSection>

          {/* Progress Indicators */}
          <ComponentSection title="Progress Indicators">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComponentDemo title="Progress Bar" description="Linear progress indicator">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[#F1F5F9]">Processing video...</span>
                    <span className="text-[#94A3B8]">65%</span>
                  </div>
                  <Progress value={65} className="bg-[#334155] [&>div]:bg-gradient-to-r [&>div]:from-[#00F0D9] [&>div]:to-[#3B1FE2]" />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Status Badge with Icon" description="Processing status indicator">
                <div className="flex flex-wrap gap-3">
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                    <Clock className="w-3 h-3 mr-1" />
                    Processing
                  </Badge>
                  <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
                    <Check className="w-3 h-3 mr-1" />
                    Completed
                  </Badge>
                  <Badge className="bg-red-500/10 text-red-500 border-red-500/20">
                    <X className="w-3 h-3 mr-1" />
                    Failed
                  </Badge>
                </div>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Alerts & Notifications */}
          <ComponentSection title="Alerts & Notifications">
            <div className="space-y-4">
              <ComponentDemo title="Info Alert" description="Informational message">
                <Alert className="border-[#00F0D9]/20 bg-[#00F0D9]/10">
                  <Info className="w-4 h-4 text-[#00F0D9]" />
                  <AlertDescription className="text-[#F1F5F9]">
                    Your video is being processed. This may take a few minutes.
                  </AlertDescription>
                </Alert>
              </ComponentDemo>

              <ComponentDemo title="Warning Alert" description="Warning message">
                <Alert className="border-amber-500/20 bg-amber-500/10">
                  <AlertCircle className="w-4 h-4 text-amber-500" />
                  <AlertDescription className="text-[#F1F5F9]">
                    Low credit balance. You have 5 credits remaining.
                  </AlertDescription>
                </Alert>
              </ComponentDemo>

              <ComponentDemo title="Toast Trigger" description="Toast notification example">
                <div className="flex gap-3">
                  <Button 
                    onClick={() => toast.success('Operation completed successfully!')}
                    className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]"
                  >
                    Show Success Toast
                  </Button>
                  <Button 
                    onClick={() => toast.error('Something went wrong!')}
                    variant="destructive"
                  >
                    Show Error Toast
                  </Button>
                </div>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Modals */}
          <ComponentSection title="Modal Components">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComponentDemo title="Buy Credits Modal" description="Credit purchase modal">
                <div>
                  <Button 
                    onClick={() => setShowBuyCreditsModal(true)}
                    className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]"
                  >
                    Open Buy Credits Modal
                  </Button>
                  <BuyCreditsModal 
                    isOpen={showBuyCreditsModal} 
                    onClose={() => setShowBuyCreditsModal(false)} 
                  />
                </div>
              </ComponentDemo>

              <ComponentDemo title="Subscription Modal" description="Plan upgrade modal">
                <div>
                  <Button 
                    onClick={() => setShowSubscriptionModal(true)}
                    className="bg-gradient-to-r from-[#00F0D9] to-[#3B1FE2]"
                  >
                    Open Subscription Modal
                  </Button>
                  <SubscriptionModal 
                    isOpen={showSubscriptionModal} 
                    onClose={() => setShowSubscriptionModal(false)} 
                  />
                </div>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Utility Components */}
          <ComponentSection title="Utility Components">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ComponentDemo title="Tooltip" description="Hover information popup">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1E293B] border border-[#334155] text-[#F1F5F9]">
                      Hover me
                      <Info className="w-4 h-4 text-[#00F0D9]" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#1E293B] border border-[#334155] text-[#F1F5F9]">
                    <p>This is helpful tooltip information</p>
                  </TooltipContent>
                </Tooltip>
              </ComponentDemo>

              <ComponentDemo title="Separator" description="Visual divider">
                <div className="space-y-4">
                  <div className="text-[#F1F5F9]">Section 1</div>
                  <Separator className="bg-[#334155]" />
                  <div className="text-[#F1F5F9]">Section 2</div>
                </div>
              </ComponentDemo>

              <ComponentDemo title="Icon Wrapper" description="Gradient icon container">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-12 h-12 rounded-lg bg-[#00F0D9]/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-[#00F0D9]" />
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#00F0D9] to-[#3B1FE2] flex items-center justify-center">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              </ComponentDemo>

              <ComponentDemo title="Stat Display" description="Number metrics display">
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-2xl text-[#F1F5F9] mb-1">1M+</div>
                    <div className="text-[#94A3B8] text-sm">Videos Created</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-[#00F0D9] mb-1">10K+</div>
                    <div className="text-[#94A3B8] text-sm">Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-[#F1F5F9] mb-1">99.9%</div>
                    <div className="text-[#94A3B8] text-sm">Uptime</div>
                  </div>
                </div>
              </ComponentDemo>
            </div>
          </ComponentSection>

          {/* Color Palette Reference */}
          <ComponentSection title="Color Palette">
            <ComponentDemo title="Brand Colors" description="Primary colors used across the app">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#00F0D9]"></div>
                  <div className="text-[#94A3B8] text-sm">#00F0D9<br />Cyan Primary</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#3B1FE2]"></div>
                  <div className="text-[#94A3B8] text-sm">#3B1FE2<br />Purple Primary</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#0F172A] border border-[#334155]"></div>
                  <div className="text-[#94A3B8] text-sm">#0F172A<br />Background Dark</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#1E293B] border border-[#334155]"></div>
                  <div className="text-[#94A3B8] text-sm">#1E293B<br />Background Medium</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#334155]"></div>
                  <div className="text-[#94A3B8] text-sm">#334155<br />Border/Divider</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#F1F5F9] border border-[#334155]"></div>
                  <div className="text-[#94A3B8] text-sm">#F1F5F9<br />Text Primary</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#94A3B8]"></div>
                  <div className="text-[#94A3B8] text-sm">#94A3B8<br />Text Secondary</div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 rounded-lg bg-[#64748B]"></div>
                  <div className="text-[#94A3B8] text-sm">#64748B<br />Text Muted</div>
                </div>
              </div>
            </ComponentDemo>
          </ComponentSection>
        </div>

        <Footer />
      </div>
    </TooltipProvider>
  );
}

// Helper Components
function ComponentSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-16">
      <h2 className="text-[#F1F5F9] mb-6 pb-3 border-b border-[#334155]">{title}</h2>
      <div className="space-y-8">
        {children}
      </div>
    </section>
  );
}

function ComponentDemo({ 
  title, 
  description, 
  children 
}: { 
  title: string; 
  description: string; 
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-[#F1F5F9] mb-1">{title}</h3>
        <p className="text-[#94A3B8] text-sm">{description}</p>
      </div>
      <div className="p-6 bg-[#0F172A] border border-[#334155] rounded-lg">
        {children}
      </div>
    </div>
  );
}
