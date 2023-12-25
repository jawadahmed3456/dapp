// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public goldBalance;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event PurchaseGold(address indexed buyer, uint256 goldAmount);
    event SellGold(address indexed seller, uint256 goldAmount);

    // Custom error for insufficient balance
    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    // Custom error for insufficient gold balance
    error InsufficientGoldBalance(uint256 goldBalance, uint256 amount);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function getGoldBalance() public view returns(uint256){
        return goldBalance;
    }

    function deposit(uint256 _amount) public payable {
        uint _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    function purchaseGold(uint256 _goldAmount) public payable {
        // Check if the sender is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // Check if there is enough ether sent for the purchase
        require(msg.value >= _goldAmount, "Insufficient Ether for the gold purchase");

        // Update the gold balance
        goldBalance += _goldAmount;

        // Emit the purchase event
        emit PurchaseGold(msg.sender, _goldAmount);
    }

    function sellGold(uint256 _goldAmount) public {
        // Check if the sender is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // Check if there is enough gold balance for the sale
        if (goldBalance < _goldAmount) {
            revert InsufficientGoldBalance({
                goldBalance: goldBalance,
                amount: _goldAmount
            });
        }

        // Update the gold balance
        goldBalance -= _goldAmount;

        // Transfer Ether to the seller
        payable(msg.sender).transfer(_goldAmount);

        // Emit the sell event
        emit SellGold(msg.sender, _goldAmount);
    }

    // custom error
    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance(
                balance,
                _withdrawAmount
            );
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }
}
