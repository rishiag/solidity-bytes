# Solidity Bytes 🚀

> **Learn Solidity through interactive, hands-on exercises with zero setup required**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green.svg)](https://nodejs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.24+-blue.svg)](https://soliditylang.org/)

## 📖 Overview

Solidity Bytes is an interactive learning platform designed to help developers master Solidity smart contract development through hands-on, test-driven exercises. The platform provides a zero-setup environment where learners can write, test, and debug Solidity code directly in their browser against a real local blockchain.

### 🎯 Mission

To democratize Solidity education by providing:
- **Zero-setup learning environment** - No installations, wallets, or testnets required
- **Real blockchain interaction** - Execute code against actual local blockchain
- **Progressive learning path** - From basics to advanced Ethereum concepts
- **Immediate feedback** - Real-time compilation, testing, and debugging
- **Comprehensive curriculum** - 54+ curated exercises covering all essential topics

## ✨ Key Features

### 🎓 **Interactive Learning Experience**
- **Monaco Editor Integration** - Professional code editor with Solidity syntax highlighting
- **Real-time Compilation** - Instant feedback on syntax errors and compilation issues
- **Live Testing** - Run tests against Hardhat network and see actual blockchain output
- **Progress Tracking** - Monitor your learning journey with completion tracking
- **Solution Access** - View reference solutions to understand best practices

### 🔧 **Zero-Setup Environment**
- **Browser-based** - No local installations required
- **Docker-powered** - Isolated execution environment for security
- **Hardhat Integration** - Industry-standard development framework
- **Automatic Setup** - Pre-configured Solidity environment

### 📚 **Comprehensive Curriculum**

#### **Programming Basics (31 exercises)**
- **Variables & Types**: `uint`, `string`, `bool`, arrays, mappings, structs
- **Functions**: Pure, view, state-changing functions with parameters
- **Control Flow**: If/else statements, loops, logical operators
- **Data Structures**: Arrays, mappings, structs, and their operations
- **Arithmetic**: Mathematical operations, division, modulo, exponentiation

#### **Ethereum Basics (23 exercises)**
- **Blockchain Context**: `msg.sender`, `msg.value`, block information
- **Gas & Units**: Wei, Gwei, Ether conversions, gas optimization
- **Error Handling**: `require`, `revert`, custom errors, `assert`
- **Visibility**: Public, private, internal, external functions
- **Events & Logging**: Event declaration, emission, and handling
- **Contract Interaction**: Interfaces, contract calls, deployment
- **Advanced Features**: Payable functions, receive/fallback, selfdestruct

## 🏗️ Architecture

### **Frontend Stack**
- **React 18** - Modern UI framework with hooks
- **Vite** - Fast build tool and development server
- **Material-UI** - Professional component library
- **Monaco Editor** - VS Code's web-based editor
- **React Router** - Client-side routing

### **Backend Stack**
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Hardhat** - Ethereum development environment
- **Docker** - Containerized execution environment
- **Session Management** - User authentication and progress tracking

### **Development Tools**
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting
- **Solhint** - Solidity-specific linting
- **Mocha/Chai** - Testing framework

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ 
- npm or yarn
- Docker (for local development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/solidity-bytes.git
   cd solidity-bytes
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the development servers**
   ```bash
   # Terminal 1: Start backend
   PORT=3001 npm run server:start
   
   # Terminal 2: Start frontend
   cd frontend && npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

### Production Deployment

1. **Build the frontend**
   ```bash
   cd frontend
   npm run build
   npm run preview
   ```

2. **Configure environment variables**
   ```bash
   # Required environment variables
   PORT=3001
   SESSION_SECRET=your-secure-session-secret
   PUBLIC_BASE_URL=https://yourdomain.com
   FRONTEND_ORIGIN=https://yourdomain.com
   
   # Optional: Google OAuth for user authentication
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## 📁 Project Structure

```
solidity-bytes/
├── exercises/                 # Exercise definitions
│   ├── programming-basics/   # 31 programming fundamentals
│   └── ethereum-basics/      # 23 Ethereum-specific concepts
├── frontend/                 # React application
│   ├── src/
│   │   ├── pages/           # React components
│   │   ├── data/            # Static data and categories
│   │   └── styles.css       # Global styles
│   └── public/              # Static assets
├── server/                  # Express.js backend
│   └── index.js            # Main server file
├── scripts/                # Utility scripts
│   ├── run-exercise.js     # Exercise execution engine
│   └── validate-exercises.js
├── docker/                 # Docker configuration
└── docs/                   # Documentation
```

## 🎯 Learning Path

### **Level 1: Programming Fundamentals**
Start with basic Solidity concepts:
- Variable declarations and types
- Function definitions and visibility
- Control flow and logic
- Data structures and operations

### **Level 2: Ethereum Integration**
Progress to blockchain-specific features:
- Transaction context (`msg.sender`, `msg.value`)
- Gas optimization and units
- Error handling and validation
- Events and logging

### **Level 3: Advanced Concepts**
Master advanced Ethereum development:
- Contract interactions and interfaces
- Advanced patterns and best practices
- Security considerations
- Deployment and testing strategies

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### **Adding New Exercises**
1. Create a new YAML file in the appropriate category
2. Follow the existing exercise format
3. Include comprehensive tests
4. Add clear explanations and hints

### **Code Contributions**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### **Documentation**
- Improve README and documentation
- Add code comments
- Create tutorials or guides

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Hardhat Team** - For the excellent Ethereum development framework
- **Monaco Editor** - For the powerful web-based code editor
- **Material-UI** - For the beautiful component library

## 📞 Contact & Support

- **GitHub Issues**: [Report bugs or request features](https://github.com/rishiag/solidity-bytes/issues)
- **Discussions**: [Join the community](https://github.com/rishiag/solidity-bytes/discussions)
- **Email**: rishiag.iitd at gmail.com

## 🌟 Roadmap

To be Updated

**Made with ❤️ for the Ethereum community**

*Empowering developers to build the future of decentralized applications*

