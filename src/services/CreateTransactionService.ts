import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getRepository(Category);
    let tempCategory = '';
    const getCategory = await categoryRepository.findOne({
      where: { title: category },
    });
    if (!getCategory) {
      const newCategory = categoryRepository.create({
        title: category,
      });
      await categoryRepository.save(newCategory);
      tempCategory = newCategory.id;
    } else {
      tempCategory = getCategory.id;
    }

    const transaction = transactionRepository.create({
      title,
      value,
      type,
      category_id: tempCategory,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
