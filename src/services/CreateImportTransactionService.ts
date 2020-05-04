import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request<Transaction> {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute(transactions: Request): Promise<Transaction[]> {
    const transactionRepository = getCustomRepository(TransactionRepository);

    const transaction = transactionRepository.create(transactions);

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
