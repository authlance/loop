import { injectable, inject, named } from 'inversify'
import { ContributionProvider, notEmpty } from '../common'
import { RouteContribution, RoutesApplicationContribution, RoutesProvider } from '../common/routes/routes'
import path from 'path'

@injectable()
export class FrontEndRoutesProvider implements RoutesProvider {
    @inject(ContributionProvider) @named(RoutesApplicationContribution)
    protected readonly contributions: ContributionProvider<RoutesApplicationContribution>;
    private routesGraph: RoutesGraph | undefined;
    getRoutes(): RouteContribution[] {
        if (this.routesGraph) {
            return this.routesGraph.getRoots();
        }
        if (!this.contributions || this.contributions.getContributions() === undefined) {
            return [];
        }
        const routes = this.contributions.getContributions().filter(notEmpty).map(next => next.getRoute());
        this.routesGraph = new RoutesGraph(routes);
        return this.routesGraph.getRoots();
    }

    getChildren(route: RouteContribution): RouteContribution[] {
        if (!this.routesGraph) {
            return [];
        }
        return this.routesGraph.getChildRoutes(route);
    }

    getRoute(path: string): RouteContribution | undefined {
        if (!this.routesGraph) {
            return undefined;
        }
        return this.routesGraph.nodes.get(path);
    }

    getFlatRoutes(): RouteContribution[] {
        if (!this.routesGraph) {
            return [];
        }
        return Array.from(this.routesGraph.nodes.values())
    }
}

class RoutesGraph {

    numberOfNodes: number = 0
    numberOfEdges: number = 0
    _indegree: Array<number> = []

    nodes: Map<string, RouteContribution> = new Map()
    reverseTable: Map<string, number> = new Map()
    table: Map<number, string> = new Map()
    
    adjacencyList: Map<number, number[]> = new Map()
    root: RouteContribution | undefined
    roots: RouteContribution[] | undefined = undefined

    childrenRoutes: Map<string, RouteContribution[]> = new Map()

    constructor(targetRoutes: RouteContribution[]) {
        const parentMap = new Map<string, number[]>()
        for (let i = 0; i < targetRoutes.length; i++) {
            const route = targetRoutes[i]
            this.numberOfNodes++
            this.table.set(i, route.path)
            this.nodes.set(route.path, route)
            this.reverseTable.set(route.path, i)
            this.adjacencyList.set(i, [])
            this._indegree[i] = 0
            if (route.path === '/') {
                this.root = route
            }
            const parentDir = route.root && path.dirname(route.path) === '/' ? route.path : (route.forceParent && route.forceParent !== '' ? route.forceParent : path.dirname(route.path))
            if (!parentMap.has(parentDir)) {
                parentMap.set(parentDir, [])
            }
            if (parentDir !== route.path) {
                parentMap.get(parentDir)?.push(i)
            }
        }
        for (let i = 0; i < targetRoutes.length; i++) {
            const route = targetRoutes[i];
            const children = parentMap.get(route.path) || []
            for (const childIndex of children) {
                this.addEdge(route, targetRoutes[childIndex])
            }
        }
    }

    hasEdge(route: RouteContribution, innerRoute: RouteContribution): boolean {
        const innerDir = path.dirname(innerRoute.path)
        return innerDir === route.path
    }

    addEdge(route: RouteContribution, innerRoute: RouteContribution) {
        const w = this.reverseTable.get(innerRoute.path)
        const v = this.reverseTable.get(route.path)
        if (w === undefined || v === undefined) {
            return
        }
        this.adjacencyList.get(v)?.push(w);
        this._indegree[w]++;
        this.numberOfEdges++;
    }

    adj(v: number): number[] {
        return this.adjacencyList.get(v) || [];
    }

    outdegree(v: number): number {
        return this.adj(v).length;
    }

    indegree(v: number): number {
        return this._indegree[v];
    }

    getRoots(): RouteContribution[] {
        if (this.roots) {
            return this.roots;
        }
        const result: RouteContribution[] = []
        for (let i = 0; i < this.numberOfNodes; i++) {
            if (this.indegree(i) === 0) {
                const path = this.table.get(i)
                if (path) {
                    result.push(this.nodes.get(path) as RouteContribution)
                }
            }
        }
        this.roots = result
        return this.roots
    }

    getChildRoutes(route: RouteContribution): RouteContribution[] {
        if (this.childrenRoutes.has(route.path)) {
            return this.childrenRoutes.get(route.path) || []
        }
        const result: RouteContribution[] = []
        const v = this.reverseTable.get(route.path)
        if (v === undefined) {
            return result
        }
        for (const w of this.adj(v)) {
            const path = this.table.get(w)
            if (path) {
                result.push(this.nodes.get(path) as RouteContribution)
            }
        }
        this.childrenRoutes.set(route.path, result)
        return result
    }
}
