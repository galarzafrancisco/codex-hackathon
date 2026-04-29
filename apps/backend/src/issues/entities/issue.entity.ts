import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

export interface IssueBlockerRefEntityValue {
  id: string | null;
  identifier: string | null;
  state: string | null;
  created_at: string | null;
  updated_at: string | null;
}

@Entity({ name: 'issues' })
@Index('IDX_issues_identifier', ['identifier'])
@Index('IDX_issues_priority', ['priority'])
@Index('IDX_issues_state', ['state'])
export class IssueEntity {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column({ type: 'varchar' })
  identifier!: string;

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ nullable: true, type: 'text' })
  description!: string | null;

  @Column({ nullable: true, type: 'integer' })
  priority!: number | null;

  @Column({ type: 'varchar' })
  state!: string;

  @Column({ name: 'branch_name', nullable: true, type: 'varchar' })
  branchName!: string | null;

  @Column({ nullable: true, type: 'varchar' })
  url!: string | null;

  @Column({ type: 'simple-json' })
  labels: string[] = [];

  @Column({ name: 'blocked_by', type: 'simple-json' })
  blockedBy: IssueBlockerRefEntityValue[] = [];
}
