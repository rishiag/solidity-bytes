// Central list of practice categories. Descriptions are stored for future use,
// but the current UI only renders the category names.

function toSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

const baseCategories = [
  {
    id: toSlug('Programming Basics'),
    name: 'Programming Basics',
    description:
      'Core logic like variables, operators, loops, and conditionals, taught using Solidity syntax.',
  },
  {
    id: toSlug('Ethereum Basics'),
    name: 'Ethereum Basics',
    description:
      'Ethereum-specific concepts like gas, wei, msg.sender, block properties, and the contract lifecycle.',
  },
  {
    id: toSlug('Data Types Deep Dive'),
    name: 'Data Types Deep Dive',
    description:
      'Focuses on the nuances of each data type, such as uint sizes, signed vs. unsigned integers, and type casting.',
  },
  {
    id: toSlug('Mappings In-Depth'),
    name: 'Mappings In-Depth',
    description:
      'Explores advanced usage of mappings, including nested mappings and common patterns for managing key-value data.',
  },
  {
    id: toSlug('Arrays In-Depth'),
    name: 'Arrays In-Depth',
    description:
      'Covers the differences between storage, memory, and calldata arrays, as well as fixed-size vs. dynamic arrays.',
  },
  {
    id: toSlug('Structs & Custom Types'),
    name: 'Structs & Custom Types',
    description:
      'Teaches how to organize complex data using structs, enums, and user-defined value types.',
  },
  {
    id: toSlug('Strings & Bytes Manipulation'),
    name: 'Strings & Bytes Manipulation',
    description:
      'A dedicated section for manipulating string and bytes data, including concatenation, comparison, and conversions.',
  },
  {
    id: toSlug('Functions & Visibility'),
    name: 'Functions & Visibility',
    description:
      'A deep dive into function types (public, private, internal, external) and their security implications.',
  },
  {
    id: toSlug('Design Patterns'),
    name: 'Design Patterns',
    description:
      'Covers reusable solutions to common problems, such as the Ownable, Pausable, and Factory patterns.',
  },
  {
    id: toSlug('Contract Interaction & Interfaces'),
    name: 'Contract Interaction & Interfaces',
    description:
      'Focuses on how smart contracts communicate with each other using interfaces and external calls.',
  },
  {
    id: toSlug('Inheritance & Modifiers'),
    name: 'Inheritance & Modifiers',
    description:
      'Teaches how to build modular code using contract inheritance and how to create custom function modifiers.',
  },
  {
    id: toSlug('Upgradability Patterns'),
    name: 'Upgradability Patterns',
    description:
      'Explains how to create contracts that can be updated, covering proxy patterns and state management.',
  },
  {
    id: toSlug('Error Handling'),
    name: 'Error Handling',
    description:
      'Focuses on require(), revert(), assert(), and using Custom Errors for efficient error reporting.',
  },
  {
    id: toSlug('Common Vulnerabilities'),
    name: 'Common Vulnerabilities',
    description:
      'Presents contracts with security flaws (e.g., Re-entrancy, Integer Overflow) for the user to identify and fix.',
  },
  {
    id: toSlug('Access Control Patterns'),
    name: 'Access Control Patterns',
    description:
      'Explores methods for restricting function access, from simple ownership to Role-Based Access Control (RBAC).',
  },
  {
    id: toSlug('Security Best Practices'),
    name: 'Security Best Practices',
    description:
      'Teaches proactive security measures like the Checks-Effects-Interactions pattern and using trusted libraries.',
  },
  {
    id: toSlug('Gas Optimization Techniques'),
    name: 'Gas Optimization Techniques',
    description:
      "Exercises focused on reducing a function's transaction cost through techniques like variable packing and efficient logic.",
  },
  {
    id: toSlug('Assembly & Low-Level Calls'),
    name: 'Assembly & Low-Level Calls',
    description:
      'Introduces inline assembly (yul) for fine-grained control and explains the use of delegatecall and call.',
  },
  {
    id: toSlug('DeFi Primitives'),
    name: 'DeFi Primitives',
    description:
      'Exercises to build simplified versions of core Decentralized Finance protocols like AMMs or lending platforms.',
  },
  {
    id: toSlug('Token Standards (ERCs)'),
    name: 'Token Standards (ERCs)',
    description:
      'Practical exercises for creating standard tokens, including ERC20, ERC721, and ERC1155.',
  },
  {
    id: toSlug('Tooling & Development Lifecycle'),
    name: 'Tooling & Development Lifecycle',
    description:
      'Simulates a real-world workflow using tools like Hardhat or Foundry, including testing and deployment scripts.',
  },
]

// Mark all except the first two as locked (coming soon) for now.
const categories = baseCategories.map((c, i) => ({ ...c, locked: i > 1 }))

export default categories

