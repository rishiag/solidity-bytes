module.exports = {
  apps: [
    {
      name: 'soliditybytes-api',
      cwd: '/home/ubuntu/solidity-bytes',
      script: 'server/index.js',
      node_args: '-r dotenv/config',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      exec_mode: 'fork',
      instances: 1,                  // file-backed store prefers single writer
      max_memory_restart: '600M',
      out_file: '/home/ubuntu/solidity-bytes/logs/api.out.log',
      error_file: '/home/ubuntu/solidity-bytes/logs/api.err.log',
      merge_logs: true,
      time: true
    }
  ]
}
