import { useMemo } from 'react';
import { Account, AccountGroup } from '@/lib/types';

interface AccountNode {
  type: 'group' | 'account';
  id: string;
  number: string;
  name: string;
  children: AccountNode[];
  parent?: AccountNode;
  account?: Account;
  group?: AccountGroup;
  level: number;
}

export function useAccountStructure(accounts: Account[] = [], groups: AccountGroup[] = []) {
  return useMemo(() => {
    const nodes = new Map<string, AccountNode>();
    const rootNodes: AccountNode[] = [];

    // First create all group nodes
    groups.forEach(group => {
      nodes.set(group.id, {
        type: 'group',
        id: group.id,
        number: group.number,
        name: group.name,
        children: [],
        level: 0,
        group
      });
    });

    // Build group hierarchy
    groups.forEach(group => {
      if (group.parent_id) {
        const node = nodes.get(group.id);
        const parentNode = nodes.get(group.parent_id);
        if (node && parentNode) {
          node.parent = parentNode;
          node.level = parentNode.level + 1;
          parentNode.children.push(node);
        }
      } else {
        const node = nodes.get(group.id);
        if (node) {
          rootNodes.push(node);
        }
      }
    });

    // Add accounts to their groups
    accounts.forEach(account => {
      const node: AccountNode = {
        type: 'account',
        id: account.id,
        number: account.number,
        name: account.name,
        children: [],
        level: 0,
        account
      };

      if (account.group_id) {
        const groupNode = nodes.get(account.group_id);
        if (groupNode) {
          node.parent = groupNode;
          node.level = groupNode.level + 1;
          groupNode.children.push(node);
        } else {
          rootNodes.push(node);
        }
      } else {
        rootNodes.push(node);
      }
    });

    // Sort all nodes by number
    const sortNodes = (nodes: AccountNode[]) => {
      nodes.sort((a, b) => a.number.localeCompare(b.number));
      nodes.forEach(node => {
        if (node.children.length > 0) {
          sortNodes(node.children);
        }
      });
    };

    sortNodes(rootNodes);

    return {
      nodes,
      rootNodes,
      flatNodes: Array.from(nodes.values())
    };
  }, [accounts, groups]);
}