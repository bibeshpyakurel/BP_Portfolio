globalThis.BP_PORTFOLIO_DATA = Object.freeze({
  "version": 1,
  "generatedAt": "2026-09-11T00:00:00.000Z",
  "sourceCommit": "initial-migration",
  "profile": {
    "name": "Bibesh Pyakurel",
    "headline": "Software, data, and AI engineer building reliable systems and applied research.",
    "about": [
      "I build systems that connect software, data, and applied AI—from production-oriented APIs and data pipelines to computer-vision research.",
      "My work includes Redis-backed observability services, Azure data engineering, multi-tenant applications, and machine-learning systems designed around measurable real-world outcomes.",
      "I approach unfamiliar problems with curiosity, careful experimentation, and an emphasis on people and impact."
    ],
    "links": {
      "github": "https://github.com/bibeshpyakurel",
      "linkedin": "https://www.linkedin.com/in/bibeshpyakurel/",
      "portfolio": "https://bibesh.digital/",
      "googleScholar": ""
    }
  },
  "experience": [
    {
      "id": "uwgb-research-lead",
      "role": "Research Lead",
      "organization": "University of Wisconsin–Green Bay",
      "location": "Green Bay, WI",
      "startDate": "Feb 2026",
      "endDate": "Present",
      "summary": "Leading applied AI research spanning pavement distress assessment and multimodal benchmark evaluation.",
      "highlights": [
        "Led pavement crack detection research published on arXiv using Mask R-CNN with a ResNet-101 FPN backbone.",
        "Achieved 84.23% precision, 90.04% recall, and 87.04% F1 on the UWGB-STREETCRACK dataset.",
        "Benchmarking multimodal large language models on the SlapFinger dataset."
      ],
      "skills": [
        "Computer Vision",
        "Mask R-CNN",
        "Detectron2",
        "Multimodal LLMs",
        "Model Evaluation"
      ],
      "url": "https://www.uwgb.edu/"
    },
    {
      "id": "schneider-software-developer",
      "role": "Software Developer Intern",
      "organization": "Schneider",
      "location": "Green Bay, WI · Hybrid",
      "startDate": "May 2025",
      "endDate": "Aug 2025",
      "summary": "Built Redis observability integrations and supported internal application improvements and Azure migration work.",
      "highlights": [
        "Developed a Spring Boot client library that publishes Redis key metrics to Dynatrace.",
        "Designed support for on-premise and Azure-hosted Redis configurations.",
        "Improved React interfaces and supported application migration to Azure."
      ],
      "skills": [
        "Java",
        "Spring Boot",
        "Redis",
        "Dynatrace",
        "React",
        "Microsoft Azure"
      ],
      "url": "https://www.se.com/"
    },
    {
      "id": "brown-county-software-developer",
      "role": "Software Developer Intern",
      "organization": "Brown County",
      "location": "Green Bay, WI · Remote",
      "startDate": "Feb 2025",
      "endDate": "Apr 2025",
      "summary": "Collaborated on an ERP implementation using Odoo, Python, and PostgreSQL.",
      "highlights": [
        "Implemented backend workflows and coordinated integration across ERP modules."
      ],
      "skills": [
        "Python",
        "Odoo",
        "PostgreSQL",
        "ERP"
      ],
      "url": "https://www.browncountywi.gov/"
    },
    {
      "id": "wisys-research-assistant",
      "role": "Research Assistant – Pavement Crack Detection",
      "organization": "WiSys",
      "location": "Green Bay, WI · Remote",
      "startDate": "Sep 2024",
      "endDate": "Dec 2024",
      "summary": "Contributed to a vision-based pavement crack detection system and its publication workflow.",
      "highlights": [
        "Collected and annotated field data in Label Studio.",
        "Supported model comparisons and research writing in LaTeX and Overleaf."
      ],
      "skills": [
        "Deep Learning",
        "Label Studio",
        "LaTeX",
        "Computer Vision"
      ],
      "url": "https://www.wisys.org/"
    },
    {
      "id": "fti-data-engineer",
      "role": "Data Engineer Intern",
      "organization": "Faith Technologies Incorporated",
      "location": "Menasha, WI · Hybrid",
      "startDate": "May 2024",
      "endDate": "Aug 2024",
      "summary": "Developed Azure data pipelines, analytics dashboards, predictive models, and internal AI agents.",
      "highlights": [
        "Processed millions of records through ETL pipelines.",
        "Delivered Power BI dashboards supporting operational decisions."
      ],
      "skills": [
        "Azure Data Factory",
        "SQL",
        "Power BI",
        "Machine Learning",
        "Azure AI"
      ],
      "url": "https://www.faithtechinc.com/"
    }
  ],
  "projects": [
    {
      "id": "clearerp",
      "name": "ClearERP",
      "date": "Feb 2026 – Mar 2026",
      "summary": "Production-oriented multi-tenant ERP for inventory and procurement workflows across six industry verticals.",
      "highlights": [
        "Implemented company-level data isolation and role-based access control.",
        "Built procurement, inventory audit, KPI, and low-stock workflows."
      ],
      "technologies": [
        ".NET 9",
        "ASP.NET Core",
        "Entity Framework Core",
        "PostgreSQL",
        "React",
        "TypeScript",
        "Docker"
      ],
      "categories": [
        "backend",
        "data",
        "web"
      ],
      "links": {
        "github": "https://github.com/bibeshpyakurel/ClearERP",
        "live": "https://frontend-production-dad7.up.railway.app",
        "publication": ""
      }
    },
    {
      "id": "jobinsight",
      "name": "JobInsight",
      "date": "Jan 2026 – Feb 2026",
      "summary": "Chrome extension and secure backend that use AI to extract structured insights from job postings.",
      "highlights": [
        "Architected a Chrome MV3 extension with content script, service worker, and popup UI.",
        "Built an Express backend proxy, Google OAuth flow, and seven-day result cache."
      ],
      "technologies": [
        "Chrome MV3",
        "JavaScript",
        "Node.js",
        "Express.js",
        "OpenAI API",
        "Google OAuth"
      ],
      "categories": [
        "ai",
        "backend",
        "web"
      ],
      "links": {
        "github": "https://github.com/bibeshpyakurel/JobInsight",
        "live": "",
        "publication": ""
      }
    },
    {
      "id": "trainlytics",
      "name": "Trainlytics",
      "date": "Dec 2025 – Jan 2026",
      "summary": "Multi-tenant fitness analytics platform with database-enforced user isolation and contextual AI insights.",
      "highlights": [
        "Enforced per-user data isolation with PostgreSQL row-level security.",
        "Built authenticated tracking, analytics, monitoring, tests, and CI validation."
      ],
      "technologies": [
        "Next.js",
        "React",
        "TypeScript",
        "Supabase",
        "PostgreSQL",
        "OpenAI API",
        "GitHub Actions"
      ],
      "categories": [
        "backend",
        "data",
        "ai",
        "web"
      ],
      "links": {
        "github": "https://github.com/bibeshpyakurel/Trainlytics",
        "live": "https://trainlytics-two.vercel.app/login/",
        "publication": ""
      }
    },
    {
      "id": "pavement-distress-assessment",
      "name": "Pixel-Level Pavement Distress Assessment",
      "date": "2024 – Present",
      "summary": "Instance-segmentation research for field-collected pavement distress assessment using the UWGB-STREETCRACK dataset.",
      "highlights": [
        "Compared ResNet-50 and ResNet-101 FPN backbones in Detectron2.",
        "The best model achieved 87.04% F1."
      ],
      "technologies": [
        "Python",
        "PyTorch",
        "Detectron2",
        "Mask R-CNN",
        "Label Studio"
      ],
      "categories": [
        "research",
        "ai",
        "data"
      ],
      "links": {
        "github": "",
        "live": "",
        "publication": "https://arxiv.org/abs/2605.26095"
      }
    }
  ],
  "skills": [
    {
      "category": "Software Engineering (Backend & APIs)",
      "items": [
        "Java",
        "Spring Boot",
        "Python",
        "C#",
        ".NET",
        "Node.js",
        "REST APIs",
        "Redis",
        "PostgreSQL",
        "Authentication and RBAC",
        "CI/CD"
      ]
    },
    {
      "category": "Data Engineering & Analytics",
      "items": [
        "SQL",
        "Azure Data Factory",
        "ETL/ELT",
        "PySpark",
        "Pandas",
        "Data Modeling",
        "Data Warehousing",
        "Power BI"
      ]
    },
    {
      "category": "AI & Machine Learning",
      "items": [
        "PyTorch",
        "TensorFlow",
        "Scikit-Learn",
        "Computer Vision",
        "Mask R-CNN",
        "Detectron2",
        "Multimodal LLMs",
        "Model Evaluation",
        "OpenAI API"
      ]
    },
    {
      "category": "Cloud & Web",
      "items": [
        "Microsoft Azure",
        "AWS",
        "Docker",
        "Kubernetes",
        "GitHub Actions",
        "React",
        "Next.js",
        "TypeScript",
        "Tailwind CSS"
      ]
    }
  ],
  "publications": [
    {
      "id": "pixel-level-pavement-distress-assessment",
      "title": "Pixel-Level Pavement Distress Assessment Using Instance Segmentation",
      "authors": [
        "Logan Dewick",
        "Bibesh Pyakurel",
        "Kong Pheng Yang",
        "Nazim Choudhury",
        "M. G. Sarwar Murshed"
      ],
      "venue": "arXiv; submitted to IEEE ICMLA 2026",
      "status": "Under review",
      "date": "May 25, 2026",
      "summary": "Evaluates Mask R-CNN models on the field-collected UWGB-STREETCRACK dataset for pixel-level pavement distress assessment.",
      "links": {
        "doi": "https://doi.org/10.48550/arXiv.2605.26095",
        "arxiv": "https://arxiv.org/abs/2605.26095",
        "pdf": "https://arxiv.org/pdf/2605.26095"
      }
    }
  ]
});
