
import type { FileNode } from '../types';
import { isIgnoredFile, pathIsImage, getMimeType } from '../utils/fileUtils';
import { buildFileTree } from '../utils/treeUtils';

declare var JSZip: any;

export interface ZipProcessingResult {
    fileTree: FileNode[];
    fileContents: Map<string, string>;
}

class ZipService {
    async processZipFile(file: File): Promise<ZipProcessingResult> {
        try {
            const zip = await JSZip.loadAsync(file);
            
            const filteredFiles = Object.keys(zip.files).reduce((acc, path) => {
                if (!isIgnoredFile(path)) {
                    acc[path] = zip.files[path];
                }
                return acc;
            }, {} as { [key: string]: any });
            
            const fileTree = buildFileTree(filteredFiles);
            const fileContents = new Map<string, string>();
            const promises: Promise<void>[] = [];

            Object.values(filteredFiles).forEach((zipEntry: any) => {
                if (!zipEntry.dir) {
                    if (pathIsImage(zipEntry.name)) {
                        promises.push(
                            zipEntry.async('base64').then((content: string) => {
                                const mimeType = getMimeType(zipEntry.name);
                                const dataUrl = `data:${mimeType};base64,${content}`;
                                fileContents.set(zipEntry.name, dataUrl);
                            })
                        );
                    } else {
                        promises.push(
                            zipEntry.async('string').then((content: string) => {
                                fileContents.set(zipEntry.name, content);
                            })
                        );
                    }
                }
            });

            await Promise.all(promises);
            return { fileTree, fileContents };

        } catch (e) {
            console.error(e);
            throw new Error('Failed to process ZIP file. Please ensure it is a valid and uncorrupted file.');
        }
    }
}

export const zipService = new ZipService();
