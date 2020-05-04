import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  id: string;
}
class DeleteTransactionService {
  public async execute({ id }: Request): Promise<AppError | undefined> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const findTransactioExists = await transactionsRepository.findOne(id);

    if (!findTransactioExists) {
      return new AppError('Transaction not exists');
    }

    await transactionsRepository.delete(id);

    return undefined;
  }
}

export default DeleteTransactionService;
