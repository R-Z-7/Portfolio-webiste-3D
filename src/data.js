export const profileData = {
  personal: {
    name: "Ramees Kallan",
    location: "Leeds, West Yorkshire, United Kingdom",
    headline: "Network Support Engineer | Infrastructure & Network Support",
    subheadline: "Field & Deskside Infrastructure Support • Network Upgrades & Migrations • Cisco CCNA (In Progress)",
    email: "ramees.kallan@outlook.com",
    phone: "+44 7799 579462",
    githubUrl: "https://github.com/R-Z-7",
    linkedinUrl: "https://www.linkedin.com/in/rameezz/",
    portfolioUrl: "https://ramees.netlify.app",
    resumeUrl: "https://drive.google.com/file/d/1y4BL0VJddRN6wf-KtYk8iis7F6Utju8W/view?usp=sharing",
    availability: "Available for Hybrid, Onsite & Multi-Site Roles across UK",
    badge: "Open to New Opportunities",
    highlights: [
      "Full UK Driving Licence & Transport",
      "Based in Leeds, West Yorkshire (Rapid UK Deployment)",
      "Cisco CCNA Preparation (In Progress)",
      "Multi-Site Live Cutovers & Deployment Windows",
      "Multi-Vendor: Cisco, Fortinet, Meraki & Juniper"
    ]
  },
  
  bio: {
    lead: "Hands-on Network Support and Infrastructure Engineer dedicated to building, configuring, and sustaining mission-critical network environments with zero unplanned downtime.",
    paragraphs: [
      "With direct field and enterprise deskside experience through Cerco Ltd, Agora Solutions, and DXC Technology, I specialize in resolving complex L1–L2 infrastructure incidents, provisioning managed switches, installing enterprise wireless APs, and orchestrating live network migration cutovers.",
      "My methodology merges rigorous physical layer discipline—from patch auditing to cable verification—with logical protocol troubleshooting across TCP/IP, VLAN trunks, DHCP/DNS scopes, and dynamic routing. Backed by an MSc in Information Technology from Leeds Beckett University and active Cisco CCNA preparation, I bridge front-line technical responsiveness with disciplined network engineering."
    ],
    signatureQuote: "Digital experiences and resilient enterprises anchored by one memorable signature infrastructure."
  },

  skills: [
    {
      category: "Network Infrastructure",
      icon: "router",
      items: [
        { name: "Routers & Managed Switches", level: "Expert" },
        { name: "Cisco IOS Configuration", level: "Advanced" },
        { name: "Wireless Access Points (APs)", level: "Advanced" },
        { name: "Switch-Port Config & Patching", level: "Expert" },
        { name: "VLANs & Trunking (802.1Q)", level: "Advanced" },
        { name: "Hardware Refresh & Cutovers", level: "Expert" }
      ]
    },
    {
      category: "Protocols & Troubleshooting",
      icon: "activity",
      items: [
        { name: "TCP/IP & Subnetting (IPv4/IPv6)", level: "Expert" },
        { name: "DHCP & DNS Architecture", level: "Expert" },
        { name: "OSPF & Dynamic Routing", level: "Intermediate" },
        { name: "VPN & Secure Remote Access", level: "Advanced" },
        { name: "Wi-Fi Spectrum Fault Isolation", level: "Advanced" },
        { name: "Network Packet Analysis", level: "Advanced" }
      ]
    },
    {
      category: "Systems & Cloud",
      icon: "server",
      items: [
        { name: "ServiceNow & SLA ITSM", level: "Expert" },
        { name: "Active Directory & Group Policy", level: "Advanced" },
        { name: "Microsoft Entra ID / M365", level: "Advanced" },
        { name: "Linux Server Administration", level: "Advanced" },
        { name: "AWS Cloud Foundations", level: "Certified" },
        { name: "PowerShell & Automation Scripts", level: "Intermediate" }
      ]
    },
    {
      category: "Hardware & Tools",
      icon: "wrench",
      items: [
        { name: "Cisco, Meraki, Fortinet, Juniper", level: "Multi-Vendor" },
        { name: "Fluke Cable Testers & Toners", level: "Hands-on" },
        { name: "Cisco Packet Tracer / GNS3", level: "Lab Proficient" },
        { name: "Wireshark & Ping/Traceroute", level: "Daily Use" },
        { name: "Patch Panels & Rack Dressing", level: "Physical Standard" }
      ]
    }
  ],

  experience: [
    {
      id: "cerco",
      role: "Onsite IT Engineer / Infrastructure & Network Support",
      company: "Cerco Ltd",
      location: "Leeds / UK Client Sites",
      period: "Jan 2025 – Present",
      type: "Current",
      badge: "Active",
      summary: "Delivering second-line, deskside and field-based technical support across multi-site client environments, covering network equipment, managed switches, routers, and enterprise infrastructure.",
      bullets: [
        "Configure, install, replace, and troubleshoot Cisco and multi-vendor routers, switches, and wireless access points during planned site upgrades and network migrations.",
        "Perform structured DHCP/DNS troubleshooting, gateway reachability tests, and subnet validation to swiftly resolve network access faults.",
        "Execute switch-port provisioning, VLAN assignments, and patch cable dressing while ensuring strict physical and logical documentation.",
        "Manage end-to-end incident lifecycles within ServiceNow aligned with rigorous enterprise SLAs and stakeholder escalations.",
        "Mentor onboarding junior engineers on deployment procedures, client-site etiquette, and validation workflows."
      ]
    },
    {
      id: "agora",
      role: "Network Upgrade & Migration Project Specialist",
      company: "Agora Solutions",
      location: "UK Multi-Site Project",
      period: "2025 – Present",
      type: "Current",
      badge: "Project",
      summary: "Executing nationwide multi-site network refresh activities, coordinating hardware cutovers, and ensuring seamless service restoration across operational retail and enterprise facilities.",
      bullets: [
        "Deploy and configure upgraded routers, managed gigabit switches, Wi-Fi access points, and upstream modems during tight deployment windows.",
        "Execute live cutover procedures in sync with central remote Network Operations Centre (NOC) teams.",
        "Conduct comprehensive post-installation connectivity tests (ping latency, traceroute, DHCP scope leases, DNS resolution, and speed benchmarks).",
        "Document change manifests, device serial records, port mapping matrices, and site handover sign-offs."
      ]
    },
    {
      id: "dxc",
      role: "Onsite IT & Infrastructure Support Engineer",
      company: "DXC Technology (via Cerco Ltd)",
      location: "UK Client Enterprise Project",
      period: "Feb 2025 – Dec 2025",
      type: "Past",
      badge: "Enterprise",
      summary: "Delivered hands-on infrastructure support and network connectivity remediation across a high-density corporate environment.",
      bullets: [
        "Remediated network port connectivity, wall jack patch runs, and floor switch uplinks.",
        "Resolved endpoint network authentication and corporate Wi-Fi certificate connectivity issues.",
        "Maintained stringent CMDB inventory accuracy for enterprise assets and rack mounted equipment."
      ]
    },
    {
      id: "wincept",
      role: "Co-Founder & Technical Support Lead",
      company: "Wincept Technologies Pvt Ltd",
      location: "India / Remote",
      period: "Jan 2017 – Jan 2022",
      type: "Past",
      badge: "Leadership",
      summary: "Built and managed hosting infrastructure, Linux web servers, security configurations, and technical client support operations.",
      bullets: [
        "Administered dedicated and VPS Linux servers (Debian/Ubuntu), Nginx/Apache stacks, and domain DNS zones.",
        "Configured SSL/TLS certificates, hardened firewall rules (UFW/iptables), and automated backups.",
        "Delivered Level 2/3 technical client escalations and resolved domain/network reachability challenges."
      ]
    }
  ],

  projects: [
    {
      id: "network-refresh",
      title: "Multi-Site Enterprise Network Refresh & Cutover",
      category: "Network Engineering",
      badge: "Featured Field Project",
      description: "Complete physical and logical infrastructure overhaul across multi-site facilities. Deployed high-density managed switches, upgraded branch routers, calibrated wireless APs, and executed zero-downtime cutovers.",
      metrics: "100% Cutovers within maintenance windows • 0 Data Loss",
      tech: ["Cisco Switches", "Managed Routers", "VLANs", "Port Patching", "DHCP/DNS", "NOC Coordination"],
      highlights: [
        "Audited legacy patching layouts and formulated structured port mapping documentation prior to cutover.",
        "Physically mounted and configured replacement enterprise switches and wireless access points.",
        "Coordinated cutover calls with NOC teams, verifying upstream trunk links and gateway ARP resolution.",
        "Executed systematic validation test scripts across all client VLANs and endpoint devices."
      ],
      diagram: "Branch Router ──► Core Switch ──► Access Switch (VLANs 10, 20, 30) ──► APs & Endpoints",
      github: "https://github.com/R-Z-7"
    },
    {
      id: "ccna-topology",
      title: "Cisco CCNA Dynamic Routing & Inter-VLAN Lab",
      category: "Network Architecture",
      badge: "CCNA Lab",
      description: "Enterprise topology simulated in Cisco Packet Tracer & physical gear featuring multi-area OSPF, Router-on-a-Stick inter-VLAN routing, port security, DHCP snooping, and ACL traffic policies.",
      metrics: "Sub-second OSPF convergence • Strict Access-List isolation",
      tech: ["Cisco IOS", "OSPF", "802.1Q Trunks", "DHCP Relay", "Standard/Extended ACLs", "NAT/PAT"],
      highlights: [
        "Configured OSPF dynamic routing with designated router (DR/BDR) election across multi-access links.",
        "Implemented 802.1Q sub-interfaces for inter-VLAN segmentation (Corporate, Voice, Guest Wi-Fi, Management).",
        "Enforced port-security with sticky MAC addressing and shutdown violation actions.",
        "Configured Dynamic NAT and PAT for secure Internet edge connectivity."
      ],
      diagram: "OSPF Area 0 (Routers R1-R2-R3) ◄──► Multi-layer Switch ◄──► Access Edge (VLANs 10, 20, 99)",
      github: "https://github.com/R-Z-7"
    },
    {
      id: "telemetry-suite",
      title: "Automated Network & Server Telemetry Platform",
      category: "Infrastructure Monitoring",
      badge: "Systems & Monitoring",
      description: "Centralized observability suite polling SNMP metrics from network interfaces, monitoring router reachability, Windows Server Active Directory uptime, and forwarding threshold alerts.",
      metrics: "Real-time 15s polling • Instant threshold notifications",
      tech: ["SNMP v2c/v3", "Prometheus", "Grafana", "Syslog", "PowerShell", "Linux Server"],
      highlights: [
        "Configured SNMP communities and MIB trees to collect interface throughput, packet errors, and CPU utilization.",
        "Deployed Prometheus exporters across server nodes and network switch targets.",
        "Constructed operational dashboards visualizing bandwidth saturation and link flaps.",
        "Configured automated alerting pipelines to dispatch notifications upon gateway latency spikes."
      ],
      diagram: "SNMP Agents ──► Central Prometheus Collector ──► Grafana Dashboards + Alertmanager",
      github: "https://github.com/R-Z-7"
    },
    {
      id: "wincept-hosting",
      title: "Hardened Linux Web & Hosting Infrastructure",
      category: "Systems & Security",
      badge: "Production Hosting",
      description: "Designed and sustained high-availability Linux hosting environments hosting corporate client web platforms with automated SSL renewal, SFTP chroot jails, and DDoS perimeter filtering.",
      metrics: "99.9% Uptime across 5 years • 0 Security Breaches",
      tech: ["Ubuntu/Debian", "Nginx", "SSL/TLS Let's Encrypt", "UFW Firewalls", "SFTP Chroot", "Bash Automation"],
      highlights: [
        "Built automated deployment scripts for Nginx reverse proxies with tuned HTTP/2 caching headers.",
        "Provisioned isolated chroot SFTP user directories for secure multi-tenant client deployments.",
        "Configured Let's Encrypt automated certbot renew timers and strict HSTS headers.",
        "Hardened SSH daemon with non-standard ports, key-based authentication, and fail2ban rate limiting."
      ],
      diagram: "Internet ──► Cloudflare DNS ──► Hardened Nginx Reverse Proxy ──► Isolated App Containers",
      github: "https://github.com/R-Z-7"
    },
    {
      id: "3d-portfolio-suite",
      title: "Signature 3D Interactive WebGL Workspace",
      category: "Web & Graphics",
      badge: "Creative Tech",
      description: "Custom Three.js WebGL 3D digital studio inspired by Growon.kr featuring procedural physical materials, soft shadow mapping, Web Audio synthesizer, and smooth camera glide choreography.",
      metrics: "60 FPS WebGL • Zero heavy external 3D file dependencies",
      tech: ["Three.js", "WebGL", "Web Audio API", "Vanilla CSS", "ES Modules", "Vite"],
      highlights: [
        "Engineered procedural 3D workstation models with dynamic canvas texture monitor displaying live ping telemetry.",
        "Crafted custom Web Audio API generative chord synthesizer with vinyl static emulator.",
        "Implemented smooth spherical coordinates camera interpolation and raycasted object interaction.",
        "Designed editorial binder journal overlay with paper textures, brass clips, and responsive fluid layouts."
      ],
      diagram: "Three.js Canvas ◄──► Raycasting Controller ◄──► Camera Lerp Manager ◄──► Editorial Modal HUD",
      github: "https://github.com/R-Z-7"
    }
  ],

  certifications: [
    {
      title: "Cisco Certified Network Associate (CCNA)",
      issuer: "Cisco",
      status: "In Progress",
      year: "2026",
      featured: true,
      description: "Currently undertaking intensive preparation covering Network Fundamentals, Network Access, IP Connectivity (OSPF), IP Services (DHCP, DNS, NAT, NTP), Security Fundamentals, and Automation."
    },
    {
      title: "Microsoft Entra ID for Administrators",
      issuer: "Microsoft",
      status: "Completed",
      year: "2026",
      featured: true,
      description: "Mastery of cloud identity management, Single Sign-On (SSO), Multi-Factor Authentication (MFA), Conditional Access policies, and role-based access control (RBAC)."
    },
    {
      title: "AWS Academy Graduate – Cloud Foundations",
      issuer: "Amazon Web Services (AWS)",
      status: "Completed",
      year: "2025",
      featured: false,
      description: "Comprehensive foundational knowledge of AWS cloud infrastructure, security, VPC networking, compute (EC2), and storage architectures."
    },
    {
      title: "AWS Academy Graduate – Cloud Architecting",
      issuer: "Amazon Web Services (AWS)",
      status: "Completed",
      year: "2025",
      featured: false,
      description: "Architectural principles for resilient, cost-optimized, and secure cloud environments on AWS."
    },
    {
      title: "DevOps Foundations: Infrastructure as Code (IaC)",
      issuer: "LinkedIn Learning",
      status: "Completed",
      year: "2025",
      featured: false,
      description: "Declarative infrastructure provisioning, version-controlled environment templates, and automated rollouts."
    },
    {
      title: "ITOL / ITIL Fast Track Technical Training",
      issuer: "Cerco Ltd",
      status: "Completed",
      year: "2025",
      featured: false,
      description: "ITIL service lifecycle alignment, incident prioritization, change request handling, and SLA governance."
    }
  ],

  education: [
    {
      degree: "Master of Science in Information Technology (MSc IT)",
      grade: "Merit",
      institution: "Leeds Beckett University",
      location: "Leeds, United Kingdom",
      year: "2024",
      highlights: "Advanced modules in Cloud Computing, Network Infrastructures, Agile Systems Engineering, Database Architecture, and Enterprise Security."
    },
    {
      degree: "Bachelor of Computer Applications (BCA)",
      grade: "First Class Honours",
      institution: "University of Calicut",
      location: "India",
      year: "2022",
      highlights: "Core computer science fundamentals, data structures, TCP/IP networking protocols, operating systems, and object-oriented software engineering."
    }
  ],

  faqs: [
    {
      q: "What roles and environments are you available for?",
      a: "I am actively seeking Network Support Engineer, Infrastructure Support Engineer, Field Network Engineer, or 2nd Line Support roles. I hold a full UK Driving Licence with personal transport, am based in Leeds, and can rapidly deploy for onsite, hybrid, and multi-site client projects across the UK."
    },
    {
      q: "What is your hands-on experience with routers and switches?",
      a: "I routinely install, rack-mount, cable, configure, and troubleshoot managed enterprise switches and routers (Cisco, Meraki, Fortinet). My experience spans VLAN tagging, 802.1Q trunking, switch-port security, DHCP helper/relay, gateway verification, and post-installation validation."
    },
    {
      q: "How do you handle live network cutovers and migration windows?",
      a: "Prior to cutover, I verify hardware specs, pre-stage configs where appropriate, audit legacy patch runs, and review change tickets. During the migration window, I work in close communication with remote NOC teams, execute physical cutover steps, and run exhaustive connectivity checks (DNS, DHCP, gateways, critical business endpoints) to certify complete operational restoration."
    },
    {
      q: "How does your Cisco CCNA preparation inform your day-to-day work?",
      a: "Preparing for the CCNA gives me a rigorous, structured mental model for network troubleshooting. Instead of guessing, I isolate faults systematically from Layer 1 (cabling, link status) through Layer 2 (VLANs, MAC learning, STP), Layer 3 (IP addressing, ARP, routing table convergence), up to Layer 7 applications."
    },
    {
      q: "What tools and ticketing platforms are you proficient in?",
      a: "I work daily with ServiceNow for SLA incident tracking and service requests, Fluke network cable testers, Cisco Packet Tracer, Wireshark, Active Directory Users & Computers, Microsoft Entra ID admin center, M365 admin portal, and command-line diagnostics (ping, traceroute, ipconfig, netstat, ssh, powershell)."
    }
  ]
};
