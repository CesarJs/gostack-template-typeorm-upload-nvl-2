import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomeSum = await this.createQueryBuilder('transactions')
      .select('SUM(transactions.value) as total')
      .where({
        type: 'income',
      })
      .getRawOne();
    const outcomeSum = await this.createQueryBuilder('transactions')
      .select('SUM(transactions.value) as total')
      .where({
        type: 'outcome',
      })
      .getRawOne();
    return {
      income: incomeSum.total,
      outcome: outcomeSum.total,
      total: incomeSum.total - outcomeSum.total,
    };
  }
}

export default TransactionsRepository;
