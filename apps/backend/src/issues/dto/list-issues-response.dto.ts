import { ApiProperty } from '@nestjs/swagger';
import { IssueResponseDto } from './issue-response.dto';

export class ListIssuesResponseDto {
  @ApiProperty({
    description: 'Issues sorted for dispatch, with lower priorities first and null priorities last.',
    isArray: true,
    type: () => IssueResponseDto,
  })
  issues!: IssueResponseDto[];
}
