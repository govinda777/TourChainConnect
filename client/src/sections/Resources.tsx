import { useState } from "react";

const blogPosts = [
  {
    id: 1,
    title: "The Future of Corporate Travel in a Post-Pandemic World",
    excerpt: "Discover how the corporate travel landscape is evolving and what changes are here to stay.",
    category: "Trends",
    categoryColor: "primary",
    date: "May 15, 2023",
    imageClass: "bg-neutral-100"
  },
  {
    id: 2,
    title: "5 Ways to Make Your Corporate Travel Program More Sustainable",
    excerpt: "Practical steps to reduce the environmental impact of your business travel without compromising effectiveness.",
    category: "Sustainability",
    categoryColor: "secondary",
    date: "April 28, 2023",
    imageClass: "bg-neutral-200"
  },
  {
    id: 3,
    title: "Prioritizing Employee Wellness During Business Travel",
    excerpt: "Learn how leading companies are supporting their employees' well-being during business trips.",
    category: "Wellness",
    categoryColor: "accent",
    date: "April 10, 2023",
    imageClass: "bg-neutral-300"
  }
];

type TabType = 'blog' | 'case-studies' | 'webinars' | 'guides';

export default function Resources() {
  const [activeTab, setActiveTab] = useState<TabType>('blog');
  
  return (
    <section id="resources" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-primary font-feature text-sm font-semibold uppercase tracking-wider">Knowledge Center</span>
          <h2 className="text-3xl font-bold mt-2 mb-6">Latest Resources & Insights</h2>
          <p className="text-lg text-neutral-700">Stay updated with the latest trends and best practices in corporate travel management.</p>
        </div>
        
        <div className="mb-12">
          <div className="flex justify-center border-b border-neutral-200 flex-wrap">
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'blog' ? 'text-primary tab-active' : 'text-neutral-500 hover:text-neutral-700'}`}
              onClick={() => setActiveTab('blog')}
            >
              Blog Articles
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'case-studies' ? 'text-primary tab-active' : 'text-neutral-500 hover:text-neutral-700'}`}
              onClick={() => setActiveTab('case-studies')}
            >
              Case Studies
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'webinars' ? 'text-primary tab-active' : 'text-neutral-500 hover:text-neutral-700'}`}
              onClick={() => setActiveTab('webinars')}
            >
              Webinars
            </button>
            <button 
              className={`px-6 py-3 font-medium ${activeTab === 'guides' ? 'text-primary tab-active' : 'text-neutral-500 hover:text-neutral-700'}`}
              onClick={() => setActiveTab('guides')}
            >
              Guides
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogPosts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className={`h-48 ${post.imageClass} flex items-center justify-center`}>
                <svg className="w-16 h-16 text-neutral-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 16H6c-.55 0-1-.45-1-1V6c0-.55.45-1 1-1h12c.55 0 1 .45 1 1v12c0 .55-.45 1-1 1zm-4.44-6.44l-2.35 3.02-1.56-1.88c-.2-.25-.58-.24-.78.01l-1.74 2.23c-.2.26-.02.64.29.64h8.98c.3 0 .48-.37.29-.64l-2.55-3.21c-.19-.24-.55-.24-.75.02z"/>
                </svg>
              </div>
              <div className="p-6">
                <span className={`text-xs font-medium text-${post.categoryColor} bg-${post.categoryColor}-light py-1 px-2 rounded-full`}>
                  {post.category}
                </span>
                <h3 className="text-xl font-bold mt-3 mb-2">{post.title}</h3>
                <p className="text-neutral-600 mb-4 line-clamp-2">
                  {post.excerpt}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-500">{post.date}</span>
                  <a href="#" className="text-primary font-medium hover:text-primary-dark">Read More</a>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <a href="#" className="inline-flex items-center px-6 py-3 rounded-md border border-primary text-primary hover:bg-primary-light font-medium transition">
            View All Resources
            <i className="ri-arrow-right-line ml-2"></i>
          </a>
        </div>
      </div>
    </section>
  );
}
