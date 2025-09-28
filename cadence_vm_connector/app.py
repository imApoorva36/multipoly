from flask import Flask, request, jsonify
import subprocess
import json
import logging
from typing import Dict, List, Any, Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)

class FlowCLIExecutor:
    """Handles Flow CLI command execution"""
    
    def __init__(self):
        self.base_cmd = ['flow']
    
    def execute_command(self, cmd: List[str], timeout: int = 60) -> Dict[str, Any]:
        """Execute a Flow CLI command and return structured result"""
        try:
            logger.info(f"Executing command: {' '.join(cmd)}")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                check=False
            )
            
            return {
                'success': result.returncode == 0,
                'returncode': result.returncode,
                'stdout': result.stdout.strip(),
                'stderr': result.stderr.strip(),
                'command': ' '.join(cmd)
            }
            
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Command timed out',
                'command': ' '.join(cmd)
            }
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'command': ' '.join(cmd)
            }

# Initialize executor
flow_executor = FlowCLIExecutor()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Flow CLI API'})

@app.route('/setup-ft-account', methods=['POST'])
def setup_ft_account():
    """Setup FT account for a signer"""
    data = request.get_json() or {}
    signer = data.get('signer', 'test-account-1')
    network = data.get('network', 'testnet')
    
    cmd = [
        'flow', 'transactions', 'send',
        'cadence/transactions/setup_ft_account.cdc',
        '--network', network,
        '--signer', signer
    ]
    
    result = flow_executor.execute_command(cmd)
    return jsonify(result)

@app.route('/mint-yield-token', methods=['POST'])
def mint_yield_token():
    """Mint yield tokens"""
    data = request.get_json() or {}
    
    # Required parameters
    address = data.get('address', '0x689856d0cca51731')
    amount = data.get('amount', '20.0')
    signer = data.get('signer', 'test-account-1')
    network = data.get('network', 'testnet')
    
    cmd = [
        'flow', 'transactions', 'send',
        './cadence/transactions/mint_yieldtoken.cdc',
        address, str(amount),
        '--signer', signer,
        '--network', network
    ]
    
    result = flow_executor.execute_command(cmd)
    return jsonify(result)

@app.route('/clear-handler', methods=['POST'])
def clear_handler():
    """Clear existing handler setup"""
    data = request.get_json() or {}
    signer = data.get('signer', 'test-account-1')
    network = data.get('network', 'testnet')
    
    cmd = [
        'flow', 'transactions', 'send',
        'cadence/transactions/clear_handler.cdc',
        '--network', network,
        '--signer', signer
    ]
    
    result = flow_executor.execute_command(cmd)
    return jsonify(result)

@app.route('/init-loop-handler', methods=['POST'])
def init_loop_handler():
    """Initialize loop transaction handler"""
    data = request.get_json() or {}
    
    address = data.get('address', '0x689856d0cca51731')
    signer = data.get('signer', 'test-account-1')
    network = data.get('network', 'testnet')
    
    cmd = [
        'flow', 'transactions', 'send',
        'cadence/transactions/InitLoopTransactionHandler.cdc',
        '--network', network,
        '--signer', signer,
        address
    ]
    
    result = flow_executor.execute_command(cmd)
    return jsonify(result)

@app.route('/schedule-yield-loop', methods=['POST'])
def schedule_yield_loop():
    """Schedule yield in loop with complex arguments"""
    data = request.get_json() or {}
    
    # Parameters
    amount = data.get('amount', '20.0')
    loop_type = data.get('loop_type', '1')
    duration = data.get('duration', '1000')
    signer = data.get('signer', 'test-account-1')
    network = data.get('network', 'testnet')
    
    # Build args-json
    args_json = [
        {"type": "UFix64", "value": str(amount)},
        {"type": "UInt8", "value": str(loop_type)},
        {"type": "UInt64", "value": str(duration)}
    ]
    
    cmd = [
        'flow', 'transactions', 'send',
        'cadence/transactions/ScheduleYieldInLoop.cdc',
        '--network', network,
        '--signer', signer,
        '--args-json', json.dumps(args_json)
    ]
    
    result = flow_executor.execute_command(cmd)
    return jsonify(result)

@app.route('/batch-setup', methods=['POST'])
def batch_setup():
    """Execute the full setup sequence"""
    data = request.get_json() or {}
    
    signer1 = data.get('signer1', 'test-account-1')
    signer2 = data.get('signer2', 'test-account-2')
    network = data.get('network', 'testnet')
    address = data.get('address', '0x689856d0cca51731')
    mint_amount = data.get('mint_amount', '20.0')
    
    results = []
    
    # Step 1: Create vaults for both accounts
    commands = [
        {
            'name': 'setup_ft_account_1',
            'cmd': ['flow', 'transactions', 'send', 'cadence/transactions/setup_ft_account.cdc', '--network', network, '--signer', signer1]
        },
        {
            'name': 'setup_ft_account_2',
            'cmd': ['flow', 'transactions', 'send', 'cadence/transactions/setup_ft_account.cdc', '--network', network, '--signer', signer2]
        },
        {
            'name': 'mint_tokens',
            'cmd': ['flow', 'transactions', 'send', './cadence/transactions/mint_yieldtoken.cdc', address, mint_amount, '--signer', signer1, '--network', network]
        },
        {
            'name': 'clear_handler',
            'cmd': ['flow', 'transactions', 'send', 'cadence/transactions/clear_handler.cdc', '--network', network, '--signer', signer1]
        },
        {
            'name': 'init_loop_handler',
            'cmd': ['flow', 'transactions', 'send', 'cadence/transactions/InitLoopTransactionHandler.cdc', '--network', network, '--signer', signer1, address]
        }
    ]
    
    for command_info in commands:
        result = flow_executor.execute_command(command_info['cmd'])
        result['step'] = command_info['name']
        results.append(result)
        
        # Stop if any command fails
        if not result['success']:
            break
    
    return jsonify({
        'overall_success': all(r['success'] for r in results),
        'results': results
    })

@app.route('/check-balance', methods=['POST'])
def check_balance():
    """Check account balance (you'll need to implement the actual cadence script)"""
    data = request.get_json() or {}
    
    account = data.get('account', 'test-account-1')
    network = data.get('network', 'testnet')
    
    # This assumes you have a balance checking script
    cmd = [
        'flow', 'scripts', 'execute',
        'cadence/scripts/check_balance.cdc',
        '--network', network,
        '--args-json', json.dumps([{"type": "Address", "value": account}])
    ]
    
    result = flow_executor.execute_command(cmd)
    return jsonify(result)

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)