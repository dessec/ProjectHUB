import React, { useState, useEffect, useMemo } from 'react';
import { 
  Layout, List, Calendar, BarChart3, FileText, Target, 
  Menu, Brain, Plus, Search, ChevronRight, CheckSquare,
  Trash2, Clock, X, Image as ImageIcon, Folder, FolderOpen,
  ChevronDown, Settings, MoreHorizontal, User, Bell
} from 'lucide-react';
import { storage } from './services/storage';
import { geminiService } from './services/gemini';
import { Project, Task, Note, Goal, ViewType, ChatMessage, TaskStatus } from './types';
import { ImageStudio } from './components/ImageStudio';

// --- AI Assistant Panel Component (Executive Style) ---
const AiAssistantPanel: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  contextData: string;
}> = ({ isOpen, onClose, contextData }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const responseText = await geminiService.chatWithContext(text, contextData);
      setMessages(prev => [...prev, { role: 'assistant', content: responseText || "I couldn't generate a response." }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection interrupted. Please verify API configuration." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[400px] bg-stone-900/95 backdrop-blur-xl border-l border-bronze-900/30 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out">
      <div className="p-5 border-b border-stone-800 flex justify-between items-center bg-stone-925">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-bronze-500/10 rounded-lg border border-bronze-500/20">
             <Brain className="w-5 h-5 text-bronze-500" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-stone-100 uppercase tracking-widest">Executive AI</h2>
            <p className="text-[10px] text-stone-500 font-mono">GEMINI-2.5-FLASH // ONLINE</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-white transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-stone-900">
        {messages.length === 0 && (
          <div className="text-center text-stone-500 mt-20 space-y-6">
            <div className="w-16 h-16 bg-stone-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-stone-700/50 shadow-inner">
              <Brain className="w-8 h-8 text-bronze-600 opacity-80" />
            </div>
            <div className="space-y-2">
                <p className="text-base font-medium text-stone-300">Awaiting Instructions</p>
                <p className="text-xs text-stone-500 max-w-[200px] mx-auto">I can analyze your schedule, modify virtual task lists, and provide strategic oversight.</p>
            </div>
            <div className="flex flex-col gap-3 mt-8 px-4">
              <button 
                onClick={() => sendMessage("Analyze my workload and suggest priorities for today.")}
                className="text-xs bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 p-3 rounded-lg text-stone-400 transition-all hover:border-bronze-500/30 hover:text-bronze-200 text-left flex items-center gap-3"
              >
                <Target className="w-3.5 h-3.5" />
                <span>Suggest priorities for today</span>
              </button>
              <button 
                onClick={() => sendMessage("Draft a professional summary of the 'Website Redesign' project status.")}
                className="text-xs bg-stone-800/50 hover:bg-stone-800 border border-stone-700/50 p-3 rounded-lg text-stone-400 transition-all hover:border-bronze-500/30 hover:text-bronze-200 text-left flex items-center gap-3"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Draft project status summary</span>
              </button>
            </div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 text-sm leading-relaxed shadow-md ${
              msg.role === 'user' 
                ? 'bg-bronze-600 text-white rounded-2xl rounded-br-none font-medium' 
                : 'bg-stone-800 text-stone-200 rounded-2xl rounded-bl-none border border-stone-700/50'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-800 px-5 py-4 rounded-2xl rounded-bl-none border border-stone-700 flex gap-1.5 items-center">
              <div className="w-1.5 h-1.5 bg-bronze-500 rounded-full animate-pulse"></div>
              <div className="w-1.5 h-1.5 bg-bronze-500 rounded-full animate-pulse delay-75"></div>
              <div className="w-1.5 h-1.5 bg-bronze-500 rounded-full animate-pulse delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-stone-800 bg-stone-925">
        <div className="relative">
          <input 
            type="text" 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
            placeholder="Type a command..."
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pl-4 pr-12 py-3.5 focus:outline-none focus:ring-1 focus:ring-bronze-500/50 focus:border-bronze-500/50 text-stone-200 placeholder-stone-600 text-sm transition-all shadow-inner"
          />
          <button 
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="absolute right-2 top-2 p-1.5 bg-bronze-600 rounded-lg text-white hover:bg-bronze-500 disabled:opacity-50 disabled:hover:bg-bronze-600 transition-colors shadow-lg shadow-bronze-900/20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Recursive Project Tree Component ---
interface ProjectTreeProps {
  projects: Project[];
  activeProject: string | null;
  onSelectProject: (id: string) => void;
  collapsed: boolean;
  depth?: number;
  parentId?: string;
}

const ProjectTree: React.FC<ProjectTreeProps> = ({ 
  projects, 
  activeProject, 
  onSelectProject, 
  collapsed, 
  depth = 0, 
  parentId 
}) => {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  // Filter projects for the current level
  const currentLevelProjects = projects.filter(p => {
    if (!parentId) return !p.parentId; // Root level (no parentId)
    return p.parentId === parentId;
  });

  const toggleExpand = (e: React.MouseEvent, projectId: string) => {
    e.stopPropagation();
    setExpanded(prev => ({...prev, [projectId]: !prev[projectId]}));
  };

  if (currentLevelProjects.length === 0) return null;

  return (
    <div className="flex flex-col gap-0.5">
      {currentLevelProjects.map(p => {
        const hasChildren = projects.some(child => child.parentId === p.id);
        const isExpanded = expanded[p.id];
        const isActive = activeProject === p.id;

        return (
          <div key={p.id}>
            <button 
              onClick={() => onSelectProject(p.id)} 
              className={`w-full text-left py-1.5 rounded-md flex items-center gap-2 group transition-all duration-200 relative
                ${isActive 
                  ? 'bg-stone-800/80 text-bronze-200 font-medium' 
                  : 'text-stone-500 hover:bg-stone-800/40 hover:text-stone-300'
                }
                ${collapsed ? 'px-0 justify-center' : 'px-2'}
              `}
              style={{ paddingLeft: collapsed ? 0 : `${depth * 12 + 10}px` }}
            >
              {!collapsed && hasChildren ? (
                <div 
                  role="button"
                  onClick={(e) => toggleExpand(e, p.id)}
                  className="p-0.5 rounded hover:bg-stone-700 text-stone-600 hover:text-stone-400 transition-colors"
                >
                  {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                </div>
              ) : !collapsed && (
                <div className="w-4" />
              )}

              {hasChildren ? (
                isExpanded ? <FolderOpen className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-bronze-400' : 'text-stone-600'}`} /> : <Folder className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-bronze-400' : 'text-stone-600'}`} />
              ) : (
                <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: p.color }} />
              )}
              
              {!collapsed && <span className="truncate text-xs tracking-tight">{p.name}</span>}
            </button>

            {!collapsed && isExpanded && (
              <ProjectTree 
                projects={projects} 
                activeProject={activeProject} 
                onSelectProject={onSelectProject} 
                collapsed={collapsed} 
                depth={depth + 1}
                parentId={p.id}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

// --- Main App Component ---
export default function ProjectManager() {
  const [view, setView] = useState<ViewType>('board');
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState<'project' | 'task' | 'goal' | 'note' | null>(null);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      const p = await storage.get('projects');
      const t = await storage.get('tasks');
      const n = await storage.get('notes');
      const g = await storage.get('goals');
      if (p) setProjects(p);
      if (t) setTasks(t);
      if (n) setNotes(n);
      if (g) setGoals(g);
    };
    loadData();
  }, []);

  const saveData = (key: string, data: any) => {
    storage.set(key, data);
  };

  const activeProjectData = useMemo(() => projects.find(p => p.id === activeProject), [projects, activeProject]);

  const getBreadcrumbs = () => {
    if (!activeProject) return [{ id: 'all', name: 'Dashboard' }];
    
    const crumbs = [];
    let curr: Project | undefined = activeProjectData;
    while (curr) {
      crumbs.unshift({ id: curr.id, name: curr.name });
      if (curr.parentId) {
        // eslint-disable-next-line no-loop-func
        curr = projects.find(p => p.id === curr?.parentId);
      } else {
        curr = undefined;
      }
    }
    return [{ id: 'all', name: 'Dashboard' }, ...crumbs];
  };

  const getRelevantProjectIds = (rootId: string): string[] => {
    const ids = [rootId];
    const children = projects.filter(p => p.parentId === rootId);
    children.forEach(c => {
      ids.push(...getRelevantProjectIds(c.id));
    });
    return ids;
  };

  const filteredTasks = tasks.filter(t => {
    if (activeProject) {
       const relevantIds = getRelevantProjectIds(activeProject);
       if (!relevantIds.includes(t.projectId)) return false;
    }
    if (searchQuery) {
      return t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
             t.description.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const getProjectColor = (id: string) => projects.find(p => p.id === id)?.color || '#57534e';

  // Handlers
  const addProject = (name: string, color: string, parentId?: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      color,
      status: 'active',
      created: new Date().toISOString(),
      parentId: parentId === 'none' ? undefined : parentId
    };
    const updated = [...projects, newProject];
    setProjects(updated);
    saveData('projects', updated);
    setShowModal(null);
  };

  const addTask = (data: Partial<Task>) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: data.title || 'New Task',
      description: data.description || '',
      status: 'todo',
      priority: data.priority || 'medium',
      projectId: data.projectId || activeProject || (projects[0]?.id) || '',
      dueDate: data.dueDate || new Date().toISOString(),
      tags: [],
      timeSpent: 0,
    };
    const updated = [...tasks, newTask];
    setTasks(updated);
    saveData('tasks', updated);
    setShowModal(null);
  };
  
  const deleteTask = (id: string) => {
      const updated = tasks.filter(t => t.id !== id);
      setTasks(updated);
      saveData('tasks', updated);
  };

  const updateTaskStatus = (id: string, status: TaskStatus) => {
      const updated = tasks.map(t => t.id === id ? { ...t, status } : t);
      setTasks(updated);
      saveData('tasks', updated);
  };

  const NavItem = ({ id, icon: Icon, label }: { id: ViewType, icon: any, label: string }) => (
    <button 
      onClick={() => setView(id)}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-all duration-200 group relative
        ${view === id 
          ? 'bg-stone-800 text-bronze-200 shadow-sm border border-stone-700/50' 
          : 'text-stone-500 hover:bg-stone-800/50 hover:text-stone-300'
        }`}
    >
      <Icon className={`w-4 h-4 transition-colors ${view === id ? 'text-bronze-500' : 'text-stone-600 group-hover:text-stone-400'}`} />
      {!sidebarCollapsed && <span className="text-sm font-medium tracking-wide">{label}</span>}
      {view === id && <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-bronze-500" />}
    </button>
  );

  return (
    <div className="h-screen bg-stone-950 text-stone-200 flex overflow-hidden font-sans selection:bg-bronze-500/20">
      
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-18' : 'w-72'} bg-stone-900 border-r border-stone-800 flex flex-col transition-all duration-300 ease-in-out z-20 shadow-2xl`}>
        {/* Sidebar Header */}
        <div className="p-5 flex items-center justify-between h-18 border-b border-stone-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-bronze-500 to-bronze-700 rounded-lg flex items-center justify-center shadow-lg shadow-bronze-900/20">
                <span className="font-bold text-white text-sm">PH</span>
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white leading-none">
                  ProjectHub
                </h1>
                <span className="text-[10px] text-stone-500 font-mono tracking-widest uppercase">Exec Suite</span>
              </div>
            </div>
          )}
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 hover:bg-stone-800 rounded-md text-stone-500 hover:text-white transition-colors ml-auto"
          >
            <Menu className="w-4 h-4" />
          </button>
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 overflow-y-auto py-6 custom-scrollbar flex flex-col gap-8">
          <div className="px-4">
            {!sidebarCollapsed && <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-3 px-2">Workspace</h3>}
            <NavItem id="board" icon={Layout} label="Board View" />
            <NavItem id="list" icon={List} label="List View" />
            <NavItem id="calendar" icon={Calendar} label="Calendar" />
            <NavItem id="image-studio" icon={ImageIcon} label="Creative Studio" />
          </div>

          <div className="px-4">
             {!sidebarCollapsed && <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest mb-3 px-2">Insights</h3>}
            <NavItem id="analytics" icon={BarChart3} label="Analytics" />
            <NavItem id="goals" icon={Target} label="Goals & OKRs" />
            <NavItem id="notes" icon={FileText} label="Notes" />
          </div>

          <div className="px-4 flex-1">
            {!sidebarCollapsed && (
               <div className="flex items-center justify-between px-2 mb-3 group">
                 <h3 className="text-[10px] font-bold text-stone-600 uppercase tracking-widest">Projects</h3>
                 <button 
                  onClick={() => setShowModal('project')} 
                  className="text-stone-600 hover:text-bronze-500 hover:bg-stone-800 p-1 rounded transition-all"
                  title="Add Project"
                >
                  <Plus className="w-3.5 h-3.5"/>
                </button>
               </div>
            )}
            
            <div className="space-y-1">
                <button 
                    onClick={() => setActiveProject(null)} 
                    className={`w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 transition-colors
                        ${!activeProject 
                            ? 'bg-stone-800 text-bronze-200 font-medium' 
                            : 'text-stone-500 hover:bg-stone-800/40 hover:text-stone-300'
                        }`}
                >
                    <div className="w-4 h-4 flex items-center justify-center">
                       <Layout className="w-3.5 h-3.5" />
                    </div>
                    {!sidebarCollapsed && <span className="text-xs">All Projects</span>}
                </button>
                
                <ProjectTree 
                  projects={projects}
                  activeProject={activeProject}
                  onSelectProject={setActiveProject}
                  collapsed={sidebarCollapsed}
                />
            </div>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-925">
             <button className="flex items-center gap-3 w-full p-2 hover:bg-stone-800 rounded-lg transition-colors group">
                <div className="w-8 h-8 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 group-hover:text-white group-hover:border-bronze-500/50 transition-colors">
                    <User className="w-4 h-4" />
                </div>
                {!sidebarCollapsed && (
                    <div className="text-left">
                        <p className="text-xs font-medium text-stone-200">Executive User</p>
                        <p className="text-[10px] text-stone-500">Pro Plan</p>
                    </div>
                )}
             </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-950 relative">
        
        {/* Glass Header */}
        <header className="h-18 glass-panel flex items-center justify-between px-8 z-10 sticky top-0">
            <div className="flex items-center gap-4 flex-1">
              {/* Breadcrumbs */}
              <div className="flex items-center text-sm text-stone-500">
                 {getBreadcrumbs().map((crumb, index, arr) => (
                   <React.Fragment key={crumb.id}>
                     <span 
                        onClick={() => { if(crumb.id === 'all') setActiveProject(null); else setActiveProject(crumb.id); }}
                        className={`${index === arr.length - 1 ? 'text-stone-200 font-semibold' : 'hover:text-bronze-500 cursor-pointer transition-colors'}`}
                     >
                       {crumb.name}
                     </span>
                     {index < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 mx-2 text-stone-700" />}
                   </React.Fragment>
                 ))}
              </div>

              {/* Search */}
              <div className="relative max-w-md w-full hidden lg:block ml-8">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-600 w-4 h-4" />
                  <input 
                      type="text" 
                      placeholder="Search tasks, files, or notes..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-stone-900/50 border border-stone-800/50 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-bronze-500/50 focus:border-bronze-500/50 text-stone-200 transition-all placeholder-stone-600 hover:bg-stone-900"
                  />
              </div>
            </div>

            <div className="flex items-center gap-4">
                <button 
                  onClick={() => setAiPanelOpen(!aiPanelOpen)}
                  className={`p-2.5 rounded-lg transition-all flex items-center gap-2 border ${aiPanelOpen ? 'bg-bronze-500/10 border-bronze-500/50 text-bronze-400' : 'bg-transparent border-transparent hover:bg-stone-900 text-stone-400'}`}
                >
                    <Brain className="w-5 h-5" />
                    <span className="text-sm font-medium hidden md:block">AI Assist</span>
                </button>
                <div className="h-6 w-px bg-stone-800 mx-1"></div>
                <button className="p-2 text-stone-400 hover:text-white hover:bg-stone-800 rounded-lg transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-stone-950"></span>
                </button>
                <button 
                  onClick={() => setShowModal('task')} 
                  className="bg-stone-100 text-stone-950 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-white transition-colors shadow-lg hover:shadow-xl"
                >
                    <Plus className="w-4 h-4" />
                    <span>New Task</span>
                </button>
            </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-hidden relative bg-stone-950">
            {view === 'image-studio' ? (
                <ImageStudio />
            ) : view === 'board' ? (
                <BoardView tasks={filteredTasks} onUpdateStatus={updateTaskStatus} onDelete={deleteTask} getProjectColor={getProjectColor} />
            ) : view === 'list' ? (
                <ListView tasks={filteredTasks} onDelete={deleteTask} getProjectColor={getProjectColor} />
            ) : view === 'calendar' ? (
                <div className="h-full flex items-center justify-center text-stone-600 flex-col gap-4">
                  <div className="p-8 rounded-full bg-stone-900 border border-stone-800">
                    <Calendar className="w-12 h-12 opacity-50" />
                  </div>
                  <p className="font-light">Calendar Module Initializing...</p>
                </div>
            ) : view === 'analytics' ? (
               <div className="h-full flex items-center justify-center text-stone-600 flex-col gap-4">
                   <div className="p-8 rounded-full bg-stone-900 border border-stone-800">
                      <BarChart3 className="w-12 h-12 opacity-50" />
                   </div>
                  <p className="font-light">Analytics Dashboard Initializing...</p>
                </div>
            ) : (
                <div className="h-full flex items-center justify-center text-stone-500">Select a view</div>
            )}
        </main>
      </div>

      {/* Ai Assistant is rendered inside main layout but fixed */}
      <AiAssistantPanel 
        isOpen={aiPanelOpen} 
        onClose={() => setAiPanelOpen(false)}
        contextData={JSON.stringify({ projects, tasks: filteredTasks, notes }, null, 2)}
      />

      {/* Create Project Modal */}
      {showModal === 'project' && (
          <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="bg-stone-900 p-8 rounded-2xl w-[450px] border border-stone-800 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-light text-white flex items-center gap-3">
                        <Folder className="w-6 h-6 text-bronze-500" />
                        New Project
                    </h2>
                    <button onClick={() => setShowModal(null)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      addProject(
                        formData.get('name') as string, 
                        formData.get('color') as string,
                        formData.get('parentId') as string
                      );
                  }}>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Project Name</label>
                          <input name="name" className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-bronze-500 outline-none text-sm placeholder-stone-700" placeholder="e.g. Q4 Marketing Strategy" required autoFocus />
                        </div>
                        
                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Parent Context</label>
                          <div className="relative">
                            <select 
                              name="parentId" 
                              defaultValue={activeProject || 'none'}
                              className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-white focus:ring-1 focus:ring-bronze-500 outline-none text-sm appearance-none"
                            >
                              <option value="none">No Parent (Root Level)</option>
                              {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                              ))}
                            </select>
                            <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-stone-500 pointer-events-none" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Label Color</label>
                          <div className="flex gap-4">
                              {['#d97706', '#ef4444', '#22c55e', '#3b82f6', '#ec4899', '#78716c'].map(c => (
                                  <label key={c} className="cursor-pointer group relative">
                                      <input type="radio" name="color" value={c} className="peer hidden" defaultChecked={c === '#d97706'} />
                                      <div className="w-8 h-8 rounded-full border border-stone-700 peer-checked:ring-2 ring-stone-100 ring-offset-2 ring-offset-stone-900 transition-all" style={{ backgroundColor: c }} />
                                  </label>
                              ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-10">
                          <button type="button" onClick={() => setShowModal(null)} className="px-5 py-2.5 text-sm font-medium text-stone-400 hover:text-white transition-colors">Cancel</button>
                          <button type="submit" className="bg-bronze-600 hover:bg-bronze-500 text-white px-8 py-2.5 rounded-lg text-sm font-medium shadow-lg shadow-bronze-900/20 transition-all">Create Project</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
      
      {/* Create Task Modal */}
      {showModal === 'task' && (
           <div className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
              <div className="bg-stone-900 p-8 rounded-2xl w-[600px] border border-stone-800 shadow-2xl">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-light text-white flex items-center gap-3">
                        <CheckSquare className="w-6 h-6 text-bronze-500" />
                        New Task
                    </h2>
                    <button onClick={() => setShowModal(null)} className="text-stone-500 hover:text-white"><X className="w-5 h-5" /></button>
                  </div>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      addTask({
                          title: formData.get('title') as string,
                          description: formData.get('description') as string,
                          priority: formData.get('priority') as any,
                          projectId: formData.get('projectId') as string,
                          dueDate: formData.get('dueDate') as string
                      });
                  }}>
                      <div className="space-y-6">
                        <div>
                          <input name="title" className="w-full bg-transparent border-b border-stone-700 p-2 text-2xl font-light text-white focus:border-bronze-500 outline-none placeholder-stone-600" placeholder="Task Name..." required autoFocus />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-6">
                           <div>
                              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Project Context</label>
                              <div className="relative">
                                <select name="projectId" defaultValue={activeProject || projects[0]?.id} className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-bronze-500 outline-none appearance-none">
                                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                                <ChevronDown className="absolute right-3 top-3.5 w-4 h-4 text-stone-500 pointer-events-none" />
                              </div>
                           </div>
                           <div>
                              <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Deadline</label>
                              <input type="date" name="dueDate" className="w-full bg-stone-950 border border-stone-800 rounded-lg p-3 text-sm text-white focus:ring-1 focus:ring-bronze-500 outline-none" />
                           </div>
                        </div>

                        <div>
                           <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Details</label>
                           <textarea name="description" className="w-full bg-stone-950 border border-stone-800 rounded-lg p-4 text-sm text-stone-300 focus:ring-1 focus:ring-bronze-500 outline-none h-32 resize-none placeholder-stone-700" placeholder="Add specific requirements or notes..." />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">Priority Level</label>
                          <div className="flex gap-4">
                            {['low', 'medium', 'high'].map((p) => (
                              <label key={p} className="flex items-center gap-3 cursor-pointer bg-stone-950 px-4 py-2 rounded-lg border border-stone-800 hover:border-stone-700 transition-colors">
                                <input type="radio" name="priority" value={p} defaultChecked={p === 'medium'} className="hidden peer" />
                                <div className={`w-2 h-2 rounded-full ${
                                  p === 'high' ? 'bg-red-500' : 
                                  p === 'medium' ? 'bg-bronze-500' : 
                                  'bg-blue-500'
                                }`}></div>
                                <span className="text-sm capitalize text-stone-400 peer-checked:text-white font-medium">{p}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-stone-800">
                          <button type="button" onClick={() => setShowModal(null)} className="px-5 py-2.5 text-sm font-medium text-stone-400 hover:text-white transition-colors">Discard</button>
                          <button type="submit" className="bg-white text-stone-950 hover:bg-stone-200 px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg transition-colors">Add Task</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
}

// --- Sub Components (Views) ---

const BoardView = ({ tasks, onUpdateStatus, onDelete, getProjectColor }: any) => {
    const columns: {id: TaskStatus, label: string}[] = [
        { id: 'todo', label: 'Backlog' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'review', label: 'Review' },
        { id: 'done', label: 'Complete' }
    ];

    return (
        <div className="flex h-full p-8 gap-8 overflow-x-auto bg-stone-950">
            {columns.map(col => (
                <div key={col.id} className="flex-shrink-0 w-80 flex flex-col max-h-full">
                    <div className="mb-4 flex justify-between items-center px-1 border-b border-stone-800 pb-2">
                        <h3 className="font-bold text-stone-500 text-xs uppercase tracking-widest">{col.label}</h3>
                        <span className="bg-stone-800 text-stone-400 px-2 py-0.5 rounded-full text-[10px] font-mono border border-stone-700">
                            {tasks.filter((t: Task) => t.status === col.id).length}
                        </span>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar pb-10">
                        {tasks.filter((t: Task) => t.status === col.id).map((task: Task) => (
                            <TaskCard 
                                key={task.id} 
                                task={task} 
                                projectColor={getProjectColor(task.projectId)}
                                onNext={() => {
                                    const next = col.id === 'todo' ? 'in-progress' : col.id === 'in-progress' ? 'review' : 'done';
                                    if (col.id !== 'done') onUpdateStatus(task.id, next);
                                }}
                                onDelete={() => onDelete(task.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

const ListView = ({ tasks, onDelete, getProjectColor }: any) => (
    <div className="p-8 max-w-7xl mx-auto h-full overflow-y-auto custom-scrollbar">
        <div className="bg-stone-900/50 rounded-2xl border border-stone-800 overflow-hidden shadow-2xl backdrop-blur-sm">
            <table className="w-full text-left border-collapse">
                <thead className="bg-stone-900 text-stone-500 text-[10px] uppercase tracking-widest font-bold border-b border-stone-800">
                    <tr>
                        <th className="p-5 pl-8 font-bold">Task Description</th>
                        <th className="p-5 font-bold">Status</th>
                        <th className="p-5 font-bold">Priority</th>
                        <th className="p-5 font-bold">Timeline</th>
                        <th className="p-5 text-right pr-8 font-bold">Controls</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-stone-800/50">
                    {tasks.map((task: Task) => (
                        <tr key={task.id} className="hover:bg-stone-800/30 transition-colors group">
                            <td className="p-5 pl-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: getProjectColor(task.projectId) }} />
                                    <div>
                                        <div className="font-medium text-stone-200 text-sm tracking-tight">{task.title}</div>
                                        <div className="text-xs text-stone-500 truncate max-w-[300px] mt-0.5 font-light">{task.description}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="p-5">
                                <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider items-center gap-1.5 border
                                    ${task.status === 'done' ? 'bg-green-900/10 text-green-500 border-green-900/30' : 'bg-stone-800 text-stone-400 border-stone-700'}`}>
                                    {task.status.replace('-', ' ')}
                                </span>
                            </td>
                            <td className="p-5">
                                <div className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded w-fit
                                    ${task.priority === 'high' ? 'text-red-400' : task.priority === 'medium' ? 'text-bronze-400' : 'text-blue-400'}`}>
                                    {task.priority}
                                </div>
                            </td>
                            <td className="p-5 text-sm text-stone-400 font-mono text-xs">
                                {new Date(task.dueDate).toLocaleDateString()}
                            </td>
                            <td className="p-5 text-right pr-8">
                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 hover:bg-stone-800 rounded-lg text-stone-500 hover:text-white transition-colors">
                                      <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => onDelete(task.id)} className="p-2 hover:bg-red-900/20 rounded-lg text-stone-500 hover:text-red-400 transition-colors">
                                      <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);


const TaskCard = ({ task, projectColor, onNext, onDelete }: any) => (
    <div className="bg-stone-900 p-5 rounded-xl border border-stone-800 hover:border-bronze-500/30 transition-all shadow-sm hover:shadow-xl group relative group/card">
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: projectColor }} />
              <span className={`text-[10px] font-bold uppercase tracking-wider text-stone-500`}>
                 {task.priority} Priority
              </span>
            </div>
            <button onClick={onDelete} className="text-stone-600 hover:text-red-400 opacity-0 group-hover/card:opacity-100 transition-opacity p-1">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
        
        <h4 className="font-medium text-stone-200 text-sm mb-2 leading-snug">{task.title}</h4>
        <p className="text-xs text-stone-500 mb-5 line-clamp-2 h-8 font-light leading-relaxed">{task.description}</p>
        
        <div className="flex items-center justify-between pt-3 border-t border-stone-800">
            <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
                <Clock className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </div>
            
            {task.status !== 'done' && (
                <button 
                  onClick={onNext} 
                  className="p-1.5 bg-stone-800 hover:bg-bronze-600 rounded-md text-stone-400 hover:text-white transition-all shadow-sm"
                  title="Move to next stage"
                >
                    <ChevronRight className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    </div>
);